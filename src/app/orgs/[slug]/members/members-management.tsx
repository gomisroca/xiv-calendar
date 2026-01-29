"use client";

import Image from "next/image";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { assignRoleToMember, removeMember } from "@/server/actions/members";
import { redirect } from "next/navigation";

interface MembersManagementProps {
  orgId: string;
  userId: string;
  members: {
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    role: {
      id: string;
      name: string;
      isSystem: boolean;
    };
  }[];
  roles: {
    id: string;
    name: string;
  }[];
}

export default function MembersManagementPage({
  orgId,
  userId,
  members,
  roles,
}: MembersManagementProps) {
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const userMembership = members.find((m) => m.user.id === userId);
  if (!userMembership) return redirect("/unauthorized");

  const { user, role: userRole } = userMembership;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Members</h1>

      <div className="space-y-4">
        {members.map(({ user: member, role }) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-black"
          >
            {/* User */}
            <div className="flex items-center gap-3">
              <Image
                src={member.image ?? "/default-avatar.png"}
                alt={member.name ?? "User"}
                width={36}
                height={36}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-medium">
                  {member.name ?? "Unknown user"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Role select */}
              <select
                value={role.id}
                disabled={
                  savingUserId === member.id ||
                  user.id === member.id ||
                  (role.name === "Owner" && role.isSystem)
                }
                onChange={async (e) => {
                  try {
                    setSavingUserId(member.id);
                    await assignRoleToMember({
                      orgId,
                      roleId: e.target.value,
                    });
                  } finally {
                    setSavingUserId(null);
                  }
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-black"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Remove */}
              <button
                disabled={
                  removingUserId === member.id ||
                  user.id === member.id ||
                  (userRole.name === "Owner" && userRole.isSystem)
                }
                onClick={async () => {
                  if (!confirm("Remove this member from the organization?"))
                    return;

                  try {
                    setRemovingUserId(member.id);
                    await removeMember({
                      orgId,
                    });
                  } finally {
                    setRemovingUserId(null);
                  }
                }}
                className="rounded-md p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed dark:hover:bg-red-500/10"
                aria-label="Remove member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
