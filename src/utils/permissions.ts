import { Permission, type Prisma } from "generated/prisma";

interface DefaultRole {
  name: string;
  permissions: Permission[];
}

const DEFAULT_ROLES: DefaultRole[] = [
  {
    name: "Owner",
    permissions: [
      Permission.ORG_UPDATE,
      Permission.ROLE_CREATE,
      Permission.ROLE_UPDATE,
      Permission.ROLE_DELETE,
      Permission.ROLE_ASSIGN,
      Permission.MEMBER_REMOVE,
      Permission.EVENT_CREATE,
      Permission.EVENT_UPDATE,
      Permission.EVENT_DELETE,
    ],
  },
  {
    name: "Admin",
    permissions: [
      Permission.ORG_UPDATE,
      Permission.ROLE_CREATE,
      Permission.ROLE_UPDATE,
      Permission.ROLE_ASSIGN,
      Permission.MEMBER_REMOVE,
      Permission.EVENT_CREATE,
      Permission.EVENT_UPDATE,
      Permission.EVENT_DELETE,
    ],
  },
  {
    name: "Member",
    permissions: [Permission.EVENT_CREATE, Permission.EVENT_UPDATE],
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
