import { getPublicOrganizations } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";
import { OrgCard } from "./org-card";
import { checkUser } from "@/server/auth/permissions";

export default async function OrgsPage() {
  const userCheck = await checkUser();
  const orgs = unwrap(await getPublicOrganizations());

  return (
    <ul>
      {orgs.map((org) => (
        <li key={org.id}>
          <OrgCard org={org} user={userCheck.success ? userCheck.data : null} />
        </li>
      ))}
    </ul>
  );
}
