/*
  Warnings:

  - The values [CREATE_EVENT,EDIT_EVENT,DELETE_EVENT,MANAGE_MEMBERS] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[orgId,name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Role` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('ORG_UPDATE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_ASSIGN', 'MEMBER_REMOVE', 'EVENT_CREATE', 'EVENT_UPDATE', 'EVENT_DELETE');
ALTER TABLE "Role" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;

-- AlterTable
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_roleOrgId_roleName_fkey";
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_orgId_name_key" ON "Role"("orgId", "name");
