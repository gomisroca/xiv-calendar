import { getUserOrganizations } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";
import Link from "next/link";

export default async function OrgsPage() {
  const orgs = unwrap(await getUserOrganizations());

  return (
    <ul>
      {orgs.map((org) => (
        <li key={org.id}>
          <Link href={`/orgs/${org.slug}`}>{org.name}</Link>
        </li>
      ))}
    </ul>
  );
}
