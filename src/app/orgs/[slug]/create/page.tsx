import { db } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import { CreateEventForm } from "./create-event-form";
import { checkUser, requireOrgMember } from "@/server/auth/permissions";

type Params = Promise<{ slug: string }>;
export default async function CreateEventPage({ params }: { params: Params }) {
  const { slug } = await params;

  const userCheck = await checkUser();
  if (!userCheck.success) return redirect("/unauthorized");

  const org = await db.organization.findUnique({
    where: { slug },
  });

  if (!org) notFound();

  const membership = await requireOrgMember(userCheck.data.id, org.id);
  if (!membership.success) return redirect("/unauthorized");

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create Event for {org.name}</h1>
      <CreateEventForm org={org} />
    </div>
  );
}
