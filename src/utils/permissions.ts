import { Permission, type Prisma } from "generated/prisma";

interface DefaultRole {
  name: string;
  permissions: Permission[];
}

const DEFAULT_ROLES: DefaultRole[] = [
  {
    name: "Owner",
    permissions: [
      Permission.MANAGE_ORG,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_MEMBERS,
      Permission.MANAGE_EVENTS,
    ],
  },
  {
    name: "Admin",
    permissions: [
      Permission.MANAGE_ORG,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_MEMBERS,
      Permission.MANAGE_EVENTS,
    ],
  },
  {
    name: "Member",
    permissions: [],
  },
];

export async function createDefaultRoles(
  trx: Prisma.TransactionClient,
  orgId: string,
) {
  await Promise.all(
    DEFAULT_ROLES.map((role) =>
      trx.role.upsert({
        where: {
          orgId_name: {
            orgId,
            name: role.name,
          },
        },
        update: {
          permissions: role.permissions,
        },
        create: {
          orgId,
          name: role.name,
          permissions: role.permissions,
        },
      }),
    ),
  );
}

export async function getRoleByName(
  trx: Prisma.TransactionClient,
  orgId: string,
  name: string,
) {
  const role = await trx.role.findUnique({
    where: { orgId_name: { orgId, name } },
  });

  if (!role) {
    throw new Error(`Invariant: role "${name}" not found`);
  }

  return role;
}
