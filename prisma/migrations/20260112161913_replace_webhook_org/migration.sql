/*
  Warnings:

  - You are about to drop the column `webhookUrl` on the `organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organization" DROP COLUMN "webhookUrl",
ADD COLUMN     "discordChannelId" TEXT;
