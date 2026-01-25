import { unwrap } from "@/utils/actions";
import RSVPButtons from "./orgs/[slug]/[eventId]/rsvp-buttons";
import { getUserEvents, type UserEvent } from "@/server/actions/events";
import Link from "next/link";
import { type EventStatus } from "generated/prisma";
import { twMerge } from "tailwind-merge";
import { redirect } from "next/navigation";
import { checkUser } from "@/server/auth/permissions";
import {
  getUserOrganizations,
  type OrganizationWithRole,
} from "@/server/actions/organizations";
import Image from "next/image";

const STATUS_BADGE: Record<EventStatus, { label: string; className: string }> =
  {
    ATTENDING: {
      label: "Attending",
      className: "bg-green-100 text-green-700",
    },
    MAYBE: {
      label: "Maybe",
      className: "bg-yellow-100 text-yellow-700",
    },
    NOT_ATTENDING: {
      label: "Not attending",
      className: "bg-red-100 text-red-700",
    },
    PENDING: {
      label: "Pending",
      className: "bg-gray-100 text-gray-700",
    },
  };

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function EmptyDashboard() {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-black">
      <h2 className="text-xl font-medium">You don’t have any events yet</h2>

      <p className="mt-2 max-w-md text-slate-500">
        Events belong to organizations. Create one to start scheduling events
        and collecting RSVPs from Discord.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/orgs/create"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          Create an organization
        </Link>

        <Link
          href="/orgs"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          Browse organizations
        </Link>

        <Link
          href="/docs/getting-started"
          className="rounded-lg border px-5 py-2.5 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-950"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}

function AttendanceSummary({
  counts,
  href,
}: {
  counts: UserEvent["attendanceCounts"];
  href: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
      <div className="flex gap-4">
        <span>✅ {counts.attending}</span>
        <span>❓ {counts.maybe}</span>
        <span>⏳ {counts.pending}</span>
      </div>

      <Link
        href={href}
        className="text-indigo-600 hover:underline dark:text-indigo-400"
      >
        View attendees
      </Link>
    </div>
  );
}

function EventCard({ event }: { event: UserEvent }) {
  const status = event.myStatus;

  return (
    <div
      key={event.id}
      className="rounded-lg bg-white p-4 shadow-sm dark:bg-black"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/orgs/${event.organization.slug}/${event.id}`}>
              <h3 className="font-medium">{event.name}</h3>
            </Link>
            <p className="text-sm text-slate-500">{event.organization.name}</p>
          </div>
          <p className="text-sm text-slate-500">
            {formatEventDate(event.startsAt)}
          </p>
        </div>
        {status && (
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${STATUS_BADGE[status].className}`}
          >
            {STATUS_BADGE[status].label}
          </span>
        )}
      </div>

      <AttendanceSummary
        counts={event.attendanceCounts}
        href={`/orgs/${event.organization.slug}/${event.id}/attendance`}
      />

      <div className="mt-4">
        <RSVPButtons eventId={event.id} initialStatus={status ?? undefined} />
      </div>
    </div>
  );
}

function OrganizationCard({ org }: { org: OrganizationWithRole }) {
  return (
    <div
      key={org.id}
      className="rounded-lg bg-white p-1 shadow-sm dark:bg-black"
    >
      <Link
        href={`/orgs/${org.slug}`}
        className="flex items-start justify-start gap-4 rounded p-2 transition hover:bg-slate-200 dark:hover:bg-slate-900"
      >
        <Image
          src={org.image ?? "/placeholder.jpg"}
          alt={org.name}
          width={48}
          height={48}
          className="h-12 w-12 rounded object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-medium">{org.name}</h3>
          <p className="text-sm text-slate-500">
            {org.totalMembers} {org.totalMembers === 1 ? "member" : "members"}
          </p>
        </div>
      </Link>
      <div className="my-2 flex items-center justify-center">
        <span className="text-sm">{org.description ?? "No description"}</span>
      </div>
    </div>
  );
}

function DashboardFilters({ active }: { active: string }) {
  return (
    <div className="mt-6 mb-2 flex gap-2">
      {[
        { key: "upcoming", label: "Upcoming" },
        { key: "past", label: "Past" },
        { key: "all", label: "All" },
      ].map(({ key, label }) => (
        <Link
          key={key}
          href={`?filter=${key}`}
          className={twMerge(
            "rounded-md bg-black/50 px-3 py-1 text-xs uppercase transition hover:bg-black/70 dark:bg-white/10 dark:hover:bg-white/20",
            active === key
              ? "bg-black/70 text-white dark:bg-white/20"
              : "text-white/70",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const userCheck = await checkUser();
  if (!userCheck.success) return redirect("/unauthorized");

  const filter = (await searchParams).filter ?? "upcoming";
  const actionFilter =
    filter === "past" ? "PAST" : filter === "all" ? "ALL" : "UPCOMING";

  const events = unwrap(await getUserEvents({ filter: actionFilter }));
  const organizations = unwrap(await getUserOrganizations());

  return (
    <div>
      {/* Hero */}
      <h1 className="text-2xl font-semibold">
        Welcome back, {userCheck.data.name}
      </h1>
      <p className="mt-1">
        Events from your Discord servers, synced in real time.
      </p>

      <DashboardFilters active={filter} />
      {/* Event list */}
      {events.length > 0 ? (
        <ul className="flex flex-col items-center justify-center gap-2">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyDashboard />
      )}

      {/* Organization list */}
      {organizations.length > 0 && (
        <>
          <h2 className="mt-5 text-xl font-medium">Your Organizations</h2>

          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <li key={org.id}>
                <OrganizationCard org={org} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
