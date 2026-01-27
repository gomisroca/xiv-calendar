import { getOrganizationEvents } from "@/server/actions/events";
import { db } from "@/server/db";
import { unwrap } from "@/utils/actions";
import { notFound, redirect } from "next/navigation";
import Calendar from "./calendar";
import {
  hasPermission,
  readUser,
  requireOrgMember,
} from "@/server/auth/permissions";
import Link from "next/link";
import { DiscordIcon } from "@/app/logged-out-landing";
import { env } from "@/env";
import { Pencil } from "lucide-react";

type Params = Promise<{ slug: string }>;
export default async function OrgView({ params }: { params: Params }) {
  const { slug } = await params;

  const user = unwrap(await readUser({ redirectTo: "/unauthorized" }));

  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      createdBy: { select: { id: true } },
    },
  });

  if (!org) notFound();

  const membership = await requireOrgMember(user.id, org.id);
  if (!membership.success) return redirect("/unauthorized");

  const isAdmin = await hasPermission({
    userId: user.id,
    orgId: org.id,
    permission: "ORG_UPDATE",
  });

  const events = unwrap(await getOrganizationEvents({ orgId: org.id }));

  return (
    <>
      {/* Admin controls */}
      {isAdmin && (
        <div className="flex gap-2">
          <Link
            href={`https://discord.com/oauth2/authorize?client_id=${env.BOT_ID}&permissions=17600775989312&integration_type=0&scope=bot`}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DiscordIcon />
            Invite Bot
          </Link>
          <Link
            href={`/orgs/${org.slug}/edit`}
            className="flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pencil />
            Edit Organization
          </Link>
        </div>
      )}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.name}</h2>
            <p>
              {event.startsAt.toLocaleString()}
              {event.endsAt ? ` - ${event.endsAt.toLocaleString()}` : ""}
            </p>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <ul>
              {event.attendance.map((attendance) => (
                <li key={attendance.userId}>
                  {attendance.userName}
                  {attendance.status}
                </li>
              ))}
            </ul>
            <p>Created by {event.createdBy.name}</p>
          </li>
        ))}
      </ul>
      <Calendar slug={slug} events={events} />
    </>
  );
}
