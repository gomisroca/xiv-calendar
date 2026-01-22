"use client";

import { joinOrganization } from "@/server/actions/organizations";
import type { Organization } from "generated/prisma";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function OrgCard({
  org,
}: {
  org: Pick<Organization, "id" | "name" | "slug"> & { isMember: boolean };
}) {
  const [status, setStatus] = useState<boolean>(org.isMember);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (loading || isPending) return;
    if (status === true) return;

    setStatus(true);

    try {
      const result = await joinOrganization(org.id);
      if (!result.success) {
        throw new Error(result.error || "Joining organization failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      key={org.id}
      className="rounded-lg bg-white p-4 shadow-sm dark:bg-black"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/orgs/${org.slug}`}>
              <h3 className="font-medium">{org.name}</h3>
            </Link>
          </div>
        </div>
        {org.isMember && (
          <span className="rounded px-2 py-1 text-xs font-medium">
            Already a member
          </span>
        )}
      </div>
      {!org.isMember && (
        <div className="mt-4">
          <button
            type="button"
            className="cursor-pointer rounded px-3 py-1 font-semibold tracking-wider text-black transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={org.isMember}
            onClick={() => handleJoin()}
          >
            Join Organization
          </button>
        </div>
      )}
      {error && <span className="ml-2 text-red-500">{error}</span>}
    </div>
  );
}
