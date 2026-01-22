import { getPublicOrganizations } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";
import { OrgCard } from "./org-card";

export default async function OrgsPage() {
  const orgs = unwrap(await getPublicOrganizations());

  return (
    <ul>
      {orgs.map((org) => (
        <li key={org.id}>
          <OrgCard org={org} />
        </li>
      ))}
    </ul>
  );
}
