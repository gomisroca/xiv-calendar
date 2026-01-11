// app/orgs/[org-slug]/create/page.tsx
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { CreateEventForm } from "./create-event-form";

interface PageProps {
  params: { slug: string };
}

export default async function CreateEventPage({ params }: PageProps) {
  const org = await db.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true },
  });

  if (!org) notFound();

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create Event for {org.name}</h1>
      <CreateEventForm orgId={org.id} />
    </div>
  );
}
