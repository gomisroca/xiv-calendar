import { db } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import { CreateEventForm } from "./create-event-form";
import { readUser, requireOrgMember } from "@/server/auth/permissions";
import { unwrap } from "@/utils/actions";

type Params = Promise<{ slug: string }>;
export default async function CreateEventPage({ params }: { params: Params }) {
  const { slug } = await params;

  const user = unwrap(await readUser({ redirectTo: "/unauthorized" }));

  const org = await db.organization.findUnique({
    where: { slug },
  });

  if (!org) notFound();

  const membership = await requireOrgMember(user.id, org.id);
  if (!membership.success) return redirect("/unauthorized");

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create Event for {org.name}</h1>
      <CreateEventForm org={org} />
    </div>
  );
}
