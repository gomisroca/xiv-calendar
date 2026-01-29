"use client";

import { useMemo, useState } from "react";
import { Trash2, Plus, Save } from "lucide-react";
import { Permission, type Role } from "generated/prisma";
import { createRole, updateRole, deleteRole } from "@/server/actions/roles";

type RoleWithPermissions = Role & {
  permissions: Permission[];
};

interface RolesManagementPageProps {
  orgId: string;
  roles: RoleWithPermissions[];
}

export default function RolesManagementPage({
  orgId,
  roles,
}: RolesManagementPageProps) {
  const permissions: Permission[] = useMemo(
    () => [
      Permission.MANAGE_ORG,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_MEMBERS,
      Permission.MANAGE_EVENTS,
    ],
    [],
  );
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingRoles, setEditingRoles] = useState(roles);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<Set<Permission>>(
    new Set(),
  );

  function togglePermission(roleIndex: number, permission: Permission) {
    setEditingRoles((prev) =>
      prev.map((role, i) => {
        if (i !== roleIndex) return role;

        const perms = new Set(role.permissions);
        if (perms.has(permission)) {
          perms.delete(permission);
        } else {
          perms.add(permission);
        }

        return { ...role, permissions: Array.from(perms) };
      }),
    );
  }

  function toggleNewRolePermission(permission: Permission) {
    setNewRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Manage Roles</h1>

      {/* Existing roles */}
      <div className="space-y-6">
        {editingRoles.map((role, index) => (
          <div
            key={role.id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-black"
          >
            <div className="mb-4 flex items-center justify-between">
              <input
                value={role.name}
                onChange={(e) =>
                  setEditingRoles((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, name: e.target.value } : r,
                    ),
                  )
                }
                className="rounded-md bg-transparent px-1 text-lg font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      setSavingRoleId(role.id);
                      await updateRole({
                        roleId: role.id,
                        orgId,
                        name: role.name,
                        permissions: role.permissions,
                      });
                    } finally {
                      setSavingRoleId(null);
                    }
                  }}
                  disabled={savingRoleId === role.id}
                  className="rounded-md p-2 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                  aria-label="Save role"
                >
                  <Save className="h-4 w-4" />
                </button>

                <button
                  onClick={async () => {
                    if (!confirm(`Delete role "${role.name}"?`)) return;

                    try {
                      setDeletingRoleId(role.id);
                      await deleteRole({ roleId: role.id, orgId });
                      setEditingRoles((prev) =>
                        prev.filter((r) => r.id !== role.id),
                      );
                    } finally {
                      setDeletingRoleId(null);
                    }
                  }}
                  disabled={deletingRoleId === role.id}
                  className="rounded-md p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                  aria-label="Delete role"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {permissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={role.permissions.includes(permission)}
                    onChange={() => togglePermission(index, permission)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    {permission.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create role */}
      <div className="rounded-xl border border-dashed border-slate-300 p-6 dark:border-slate-700">
        <h2 className="mb-4 text-lg font-semibold">Create new role</h2>

        <input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="Role name"
          className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-black"
        />

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {permissions.map((permission) => (
            <label key={permission} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newRolePermissions.has(permission)}
                onChange={() => toggleNewRolePermission(permission)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
              />
              <span className="text-slate-700 dark:text-slate-300">
                {permission.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={async () => {
            if (!newRoleName.trim()) return;

            try {
              setCreating(true);

              const result = await createRole({
                orgId,
                name: newRoleName,
                permissions: Array.from(newRolePermissions),
              });
              if (!result.success) {
                throw new Error(result.error ?? "Updating role failed");
              }
              const newRole = result.data!;
              setEditingRoles((prev) => [
                ...prev,
                {
                  id: newRole.id,
                  orgId: newRole.orgId,
                  name: newRole.name,
                  permissions: newRole.permissions,
                  createdAt: newRole.createdAt,
                } as RoleWithPermissions,
              ]);

              setNewRoleName("");
              setNewRolePermissions(new Set());
            } finally {
              setCreating(false);
            }
          }}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>
    </div>
  );
}
