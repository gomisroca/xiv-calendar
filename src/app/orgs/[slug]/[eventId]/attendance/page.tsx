import { requireEventOrgMember, requireUser } from "@/server/auth/permissions";
import { getEventAttendanceUsers, maskAttendance } from "@/utils/attendance";
import { redirect } from "next/navigation";

type Params = Promise<{ eventId: string }>;
export default async function EventAttendance({ params }: { params: Params }) {
  const user = await requireUser();

  const { eventId } = await params;

  const membership = await requireEventOrgMember(user.id, eventId);
  if (!membership.success) return redirect("/unauthorized");

  const attendance = await getEventAttendanceUsers(eventId);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {(["attending", "maybe", "pending", "notAttending"] as const).map(
        (key) => {
          const users = attendance[key];

          if (!users.length) return null;

          return (
            <section key={key} className="space-y-2">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  {maskAttendance(key)}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {users.length}
                </span>
              </div>

              {/* User list */}
              <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-2 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="truncate rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    {u.name ?? "Unknown"}
                  </li>
                ))}
              </ul>
            </section>
          );
        },
      )}
    </div>
  );
}
