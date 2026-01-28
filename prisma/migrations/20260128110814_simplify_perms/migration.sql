/*
  Warnings:

  - The values [ORG_UPDATE,ROLE_CREATE,ROLE_UPDATE,ROLE_DELETE,ROLE_ASSIGN,MEMBER_REMOVE,EVENT_CREATE,EVENT_UPDATE,EVENT_DELETE] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('MANAGE_ORG', 'MANAGE_ROLES', 'MANAGE_MEMBERS', 'MANAGE_EVENTS');
ALTER TABLE "Role" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;
