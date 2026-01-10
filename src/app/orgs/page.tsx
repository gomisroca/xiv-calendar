"use client";

import { getUserOrganizations } from "@/server/actions/organizations";
import { AppError } from "@/utils/errors";
import { useEffect, useState } from "react";

type Org = {
  id: string;
  name: string;
  slug: string;
  memberships: {
    role: { name: string; permissions: string[] };
  }[];
};

interface OrgSwitcherProps {
  onOrgChange?: (org: Org) => void;
}

export default function OrgSwitcher({ onOrgChange }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgs() {
      setLoading(true);
      try {
        const data = await getUserOrganizations();
        setOrgs(data);
        if (data.length > 0) {
          setActiveOrgId(data[0]!.id);
          onOrgChange?.(data[0]!);
        }
      } catch (err: unknown) {
        if (err instanceof AppError) setError(err.message);
        else setError("Failed to load organizations");
      } finally {
        setLoading(false);
      }
    }

    void fetchOrgs();
  }, [onOrgChange]);

  const handleChange = (orgId: string) => {
    setActiveOrgId(orgId);
    const selected = orgs.find((o) => o.id === orgId);
    if (selected) onOrgChange?.(selected);
  };

  if (loading) return <p>Loading organizations...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (orgs.length === 0)
    return <p>No organizations found. Create one first!</p>;

  return (
    <div>
      <label htmlFor="org-select" className="mb-1 block font-medium">
        Active Organization
      </label>
      <select
        id="org-select"
        value={activeOrgId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded border px-3 py-2 focus:border-blue-300 focus:ring focus:outline-none"
      >
        {orgs.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name} ({org.memberships[0]?.role.name})
          </option>
        ))}
      </select>
    </div>
  );
}
