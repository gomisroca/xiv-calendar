"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { getSession } from "@/server/better-auth/server";
import { Permission, Prisma } from "generated/prisma";
import { AppError } from "@/utils/errors";

// --------------------
// Zod schema
// --------------------
const OrganizationSchema = z.object({
  name: z.string().min(1, "Organization name cannot be empty"),
});

// --------------------
// Helper to generate a clean slug
// --------------------
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function createOrganization(input: unknown) {
  const session = await getSession();
  if (!session?.user)
    throw new AppError("You must be signed in", "UNAUTHORIZED");

  const { name } = OrganizationSchema.parse(input);

  return await db.$transaction(async (trx) => {
    const slugBase = generateSlug(name);
    let slug = slugBase;
    let counter = 1;

    while (true) {
      try {
        const org = await trx.organization.create({
          data: { name, slug },
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

        return { success: true, message: `Organization "${name}" created.` };
      } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2002") {
            const target = (err.meta as { target: string[] })?.target ?? [];
            if (target.includes("slug")) {
              slug = `${slugBase}-${counter++}`;
            } else if (target.includes("name")) {
              throw new AppError(
                `Organization "${name}" already exists.`,
                "DUPLICATE",
              );
            } else {
              throw new AppError(
                "Failed to create organization due to DB constraint.",
                "UNKNOWN",
              );
            }
          } else {
            throw new AppError("Failed to create organization.", "UNKNOWN");
          }
        } else {
          console.error(err);
          throw new AppError("Failed to create organization.", "UNKNOWN");
        }
      }
    }
  });
}

export async function getUserOrganizations() {
  const session = await getSession();

  if (!session?.user) {
    throw new AppError(
      "You must be signed in to get your organizations",
      "UNAUTHORIZED",
    );
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

    return organizations;
  } catch (err: unknown) {
    console.error("Error fetching user organizations:", err);
    throw new AppError("Failed to fetch your organizations.", "UNKNOWN");
  }
}

// Example Usage
// try {
//   await createOrganization(formData);
//   setMessage({ content: "Organization created!" });
// } catch (err: any) {
//   if (err instanceof AppError) {
//     setMessage({ content: err.message, error: true });
//   } else {
//     setMessage({ content: "Unexpected error", error: true });
//   }
// }
