import CreateOrganizationForm from "./create-org-form";
import { requireUser } from "@/server/auth/permissions";

export default async function CreateOrgPage() {
  await requireUser();

  return (
    <div className="mx-auto mt-8 max-w-md">
      <CreateOrganizationForm />
    </div>
  );
}
