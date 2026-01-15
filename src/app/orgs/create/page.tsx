import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import CreateOrganizationForm from "./create-org-form";

export default async function CreateOrgPage() {
  const session = await auth();

  if (!session?.user) {
    return notFound();
  }

  return (
    <div className="mx-auto mt-8 max-w-md">
      <CreateOrganizationForm />
    </div>
  );
}
