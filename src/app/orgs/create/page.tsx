import { redirect } from "next/navigation";
import CreateOrganizationForm from "./create-org-form";
import { checkUser } from "@/server/auth/permissions";

export default async function CreateOrgPage() {
  const userCheck = await checkUser();
  if (!userCheck.success) return redirect("/unauthorized");

  return (
    <div className="mx-auto mt-8 max-w-md">
      <CreateOrganizationForm />
    </div>
  );
}
