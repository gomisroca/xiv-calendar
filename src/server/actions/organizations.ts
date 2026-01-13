"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { Permission } from "generated/prisma";
import type { ActionResult } from "@/utils/actions";

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name cannot be empty"),
  discordChannelId: z.string().min(1, "Discord channel ID is required"),
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
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = CreateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      code: "VALIDATION",
    };
  }

  const { name, discordChannelId } = parsed.data;

  try {
    const slugBase = name.toLowerCase().trim().replace(/\s+/g, "-");

    const slug = await generateSlug(slugBase);

    await db.$transaction(async (trx) => {
      const org = await trx.organization.create({
        data: { name, slug, discordChannelId },
      });

      const adminRole = await trx.role.create({
        data: {
          name: "admin",
          orgId: org.id,
          permissions: [
            Permission.CREATE_EVENT,
            Permission.EDIT_EVENT,
            Permission.DELETE_EVENT,
            Permission.MANAGE_MEMBERS,
          ],
        },
      });

      await trx.membership.create({
        data: {
          userId: session.user.id,
          orgId: org.id,
          roleOrgId: org.id,
          roleName: adminRole.name,
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

export type OrganizationWithRole = {
  id: string;
  name: string;
  slug: string;
  role: string;
  permissions: Permission[];
};

export async function getUserOrganizations(): Promise<
  ActionResult<OrganizationWithRole[]>
> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in",
      code: "UNAUTHORIZED",
    };
  }

  try {
    const organizations = await db.organization.findMany({
      where: {
        memberships: {
          some: { userId: session.user.id },
        },
      },
      include: {
        memberships: {
          where: { userId: session.user.id },
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
