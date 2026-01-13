/*
  Warnings:

  - Made the column `discordChannelId` on table `organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "discordChannelId" SET NOT NULL;
