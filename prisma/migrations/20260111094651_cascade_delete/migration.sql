-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_orgId_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_roleOrgId_roleName_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_orgId_fkey";

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roleOrgId_roleName_fkey" FOREIGN KEY ("roleOrgId", "roleName") REFERENCES "Role"("orgId", "name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
