import Modal from "@/app/_components/ui/modal";
import { checkUser, isMember } from "@/server/auth/permissions";
import { getEventAttendanceUsers, maskAttendance } from "@/utils/events";
import { redirect } from "next/navigation";

type Params = Promise<{ eventId: string }>;
export default async function EventAttendanceModal({
  params,
}: {
  params: Params;
}) {
  const userCheck = await checkUser();
  if (!userCheck.success) return redirect("/unauthorized");

  const { eventId } = await params;

  const membership = await isMember({ userId: userCheck.data.id, eventId });
  if (!membership.success) return redirect("/unauthorized");

  const attendance = await getEventAttendanceUsers(eventId);

  return (
    <Modal>
      <div className="flex space-x-2">
        {(["attending", "maybe", "pending", "notAttending"] as const).map(
          (key) => (
            <div key={key}>
              <h3 className="my-1 px-1 text-sm font-medium">
                {maskAttendance(key)}
              </h3>
              <ul className="mx-2 mb-2 text-sm text-slate-600 dark:text-slate-400">
                {attendance[key].map((u) => (
                  <li key={u.id}>{u.name ?? "Unknown"}</li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
    </Modal>
  );
}
