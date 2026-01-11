import { getUserOrganizations } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";

export default async function OrgsPage() {
  const orgs = unwrap(await getUserOrganizations());

  return (
    <ul>
      {orgs.map((org) => (
        <li key={org.id}>{org.name}</li>
      ))}
    </ul>
  );
}
