/*
  Warnings:

  - You are about to drop the column `roleName` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `roleOrgId` on the `Membership` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "roleName",
DROP COLUMN "roleOrgId",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
