import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { CreateEventForm } from "./create-event-form";

type Params = Promise<{ slug: string }>;
export default async function CreateEventPage({ params }: { params: Params }) {
  const { slug } = await params;

  const org = await db.organization.findUnique({
    where: { slug },
  });

  if (!org) notFound();

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create Event for {org.name}</h1>
      <CreateEventForm org={org} />
    </div>
  );
}
