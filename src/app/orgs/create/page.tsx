import CreateOrganizationForm from "./create-org-form";
import { readUser } from "@/server/auth/permissions";
import { unwrap } from "@/utils/actions";

export default async function CreateOrgPage() {
  unwrap(await readUser({ redirectTo: "/unauthorized" }));

  return (
    <div className="mx-auto mt-8 max-w-md">
      <CreateOrganizationForm />
    </div>
  );
}
