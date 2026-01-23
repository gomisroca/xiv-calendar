"use client";

import { joinOrganization } from "@/server/actions/organizations";
import type { Organization, User } from "generated/prisma";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { twMerge } from "tailwind-merge";

export function OrgCard({
  org,
  user,
}: {
  org: Pick<Organization, "id" | "name" | "slug" | "image" | "description"> & {
    totalMembers: number;
    isMember: boolean;
  };
  user: User | null;
}) {
  const [status, setStatus] = useState<boolean>(org.isMember);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!user) return;
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
      className="rounded-lg bg-white p-1 shadow-sm dark:bg-black"
    >
      <Link
        href={`/orgs/${org.slug}`}
        className="flex items-start justify-start gap-4 rounded p-2 transition hover:bg-slate-200 dark:hover:bg-slate-900"
      >
        <Image
          src={org.image ?? "/placeholder.jpg"}
          alt={org.name}
          width={48}
          height={48}
          className="rounded"
        />
        <div className="flex flex-col">
          <h3 className="font-medium">{org.name}</h3>
          <p className="text-sm text-slate-500">
            {org.totalMembers} {org.totalMembers === 1 ? "member" : "members"}
          </p>
        </div>
      </Link>
      <div className="my-2 flex items-center justify-center">
        <span className="text-sm">{org.description ?? "No description"}</span>
      </div>
      <div className="mb-1 flex items-center justify-center">
        {!org.isMember ? (
          <button
            type="button"
            className={twMerge(
              "cursor-pointer rounded bg-indigo-600 px-3 py-1 font-semibold tracking-wider text-white shadow-sm transition hover:bg-indigo-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
            )}
            disabled={org.isMember || !user}
            onClick={() => handleJoin()}
          >
            {user ? "Join" : "Sign in to join"}
          </button>
        ) : (
          <span className="pointer-events-none rounded bg-slate-200 px-3 py-1 font-semibold dark:bg-slate-900">
            Already a member
          </span>
        )}
      </div>
      {error && <span className="ml-2 text-red-500">{error}</span>}
    </div>
  );
}
