"use client";

import { deleteOrganization } from "@/server/actions/organizations";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteOrganizationButton({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (loading || isPending) return;

    setLoading(true);

    try {
      const result = await deleteOrganization(orgId);
      if (!result.success) {
        throw new Error(result.error || "Organization deletion failed");
      }

      startTransition(() => {
        router.push("/");
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
    <>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading || isPending}
        onClick={handleDelete}
      >
        Delete organization
      </button>
      {loading && (
        <span className="ml-2 text-sm text-gray-500">
          Deleting organization…
        </span>
      )}

      {error && <span className="ml-2 text-red-500">{error}</span>}
    </>
  );
}
