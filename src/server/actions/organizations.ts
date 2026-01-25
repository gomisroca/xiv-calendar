"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { type Organization, type Permission } from "generated/prisma";
import type { ActionResult } from "@/utils/actions";
import { checkUser } from "../auth/permissions";
import { createDefaultRoles, getRoleByName } from "@/utils/permissions";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name cannot be empty"),
  discordChannelId: z.string().min(1, "Discord channel ID is required"),
  description: z.string().optional(),
  picture: z.string().url().optional(),
  hidden: z.boolean(),
});

async function generateSlug(base: string) {
  let slug = base;
  let counter = 1;

  while (true) {
    const exists = await db.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exists) return slug;

    slug = `${base}-${counter++}`;
  }
}

export async function createOrganization(
  input: unknown,
): Promise<ActionResult<string>> {
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  const parsed = CreateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION",
    };
  }

  const { name, discordChannelId, description, picture, hidden } = parsed.data;

  try {
    const slugBase = name.toLowerCase().trim().replace(/\s+/g, "-");

    const slug = await generateSlug(slugBase);

    await db.$transaction(async (trx) => {
      const org = await trx.organization.create({
        data: {
          name,
          slug,
          discordChannelId,
          description: description ?? undefined,
          image: picture ?? undefined,
          private: hidden,
        },
      });

      await createDefaultRoles(trx, org.id);

      const ownerRole = await getRoleByName(trx, org.id, "Owner");

      await trx.membership.create({
        data: {
          userId: userCheck.data.id,
          orgId: org.id,
          roleId: ownerRole.id,
        },
      });
    });

    return {
      success: true,
      data: `Organization "${name}" created.`,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to create organization",
      code: "UNKNOWN",
    };
  }
}

export async function joinOrganization(
  orgId: string,
): Promise<ActionResult<string>> {
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  try {
    await db.$transaction(async (trx) => {
      const org = await trx.organization.findUnique({
        where: { id: orgId },
      });

      if (!org) {
        return {
          success: false,
          error: "Organization not found",
          code: "NOT_FOUND",
        } as ActionResult<string>;
      }

      const existingMembership = await trx.membership.findUnique({
        where: {
          orgId_userId: {
            orgId,
            userId: userCheck.data.id,
          },
        },
      });

      if (existingMembership) {
        return {
          success: false,
          error: "You are already a member of this organization",
          code: "CONFLICT",
        };
      }

      const memberRole = await getRoleByName(trx, orgId, "Member");

      if (!memberRole) {
        throw new Error("Invariant: Member role not found");
      }

      await trx.membership.create({
        data: {
          userId: userCheck.data.id,
          orgId,
          roleId: memberRole.id,
        },
      });
    });

    return {
      success: true,
      data: `Joined organization "${orgId}"`,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to join organization",
      code: "UNKNOWN",
    };
  }
}

export type OrganizationWithRole = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  totalMembers: number;
  role: string;
  permissions: Permission[];
};

export async function getUserOrganizations(): Promise<
  ActionResult<OrganizationWithRole[]>
> {
  const userCheck = await checkUser();
  if (!userCheck.success) return userCheck;

  try {
    const organizations = await db.organization.findMany({
      where: {
        memberships: {
          some: { userId: userCheck.data.id },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
        _count: {
          select: {
            memberships: true,
          },
        },
        memberships: {
          where: { userId: userCheck.data.id },
          include: { role: true },
        },
      },
    });

    const mapped: OrganizationWithRole[] = organizations.map((org) => {
      if (!org.memberships.length) {
        throw new Error("Invariant: user has no membership");
      }

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        image: org.image,
        description: org.description,
        totalMembers: org._count.memberships,
        role: org.memberships[0]!.role.name,
        permissions: org.memberships[0]!.role.permissions,
      };
    });

    return {
      success: true,
      data: mapped,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: "Failed to get organizations",
      code: "UNKNOWN",
    };
  }
}

export async function getPublicOrganizations(): Promise<
  ActionResult<
    (Pick<Organization, "id" | "name" | "slug" | "image" | "description"> & {
      totalMembers: number;
      isMember: boolean;
    })[]
  >
> {
  const userCheck = await checkUser();

  try {
    const organizations = await db.organization.findMany({
      where: {
        private: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
        _count: {
          select: {
            memberships: true,
          },
        },
        memberships: userCheck.success
          ? {
              where: {
                userId: userCheck.data.id,
              },
              select: {
                userId: true,
              },
              take: 1,
            }
          : false,
      },
    });

    const data = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      image: org.image,
      description: org.description,
      totalMembers: org._count.memberships,
      isMember: userCheck.success ? org.memberships.length > 0 : false,
    }));

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: "Failed to get organizations",
      code: "UNKNOWN",
    };
  }
}
