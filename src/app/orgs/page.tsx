import { getPublicOrganizations } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";
import { OrgCard } from "./org-card";
import { readUser } from "@/server/auth/permissions";

export default async function OrgsPage() {
  const userResult = await readUser();

  const orgs = unwrap(await getPublicOrganizations());

  return (
    <ul>
      {orgs.map((org) => (
        <li key={org.id}>
          <OrgCard
            org={org}
            user={userResult.success ? userResult.data : null}
          />
        </li>
      ))}
    </ul>
  );
}
