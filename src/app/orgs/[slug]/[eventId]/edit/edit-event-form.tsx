"use client";

import { unwrap } from "@/utils/actions";
import { useState } from "react";
import { updateEvent } from "@/server/actions/events";
import type { Event } from "generated/prisma";

interface EditOrganizationFormProps {
  event: Event;
}

export default function EditEventForm({ event }: EditOrganizationFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string)?.trim();
    const startsAt = formData.get("startsAt") as string;
    const endsAt = formData.get("endsAt") as string | null;
    const description = (formData.get("description") as string) ?? "";
    const location = (formData.get("location") as string) ?? "";

    try {
      const result = await updateEvent(event.id, {
        orgId: event.orgId,
        name,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : undefined,
        description,
        location,
      });

      const message = unwrap(result);
      setMessage(message);

      form.reset();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong updating the event",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-md space-y-6 rounded-xl bg-white p-8 shadow-sm dark:bg-black"
    >
      {/* Event name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Event name</label>
        <input
          type="text"
          name="name"
          defaultValue={event.name}
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Start */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Start date & time
        </label>
        <input
          type="datetime-local"
          name="startsAt"
          defaultValue={event.startsAt.toISOString()}
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* End */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          End date & time <span className="text-slate-400">(optional)</span>
        </label>
        <input
          type="datetime-local"
          name="endsAt"
          defaultValue={event.endsAt?.toISOString() ?? ""}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Event Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <input
          type="text"
          name="description"
          defaultValue={event.description ?? ""}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Event Location */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Location</label>
        <input
          type="text"
          name="location"
          defaultValue={event.location ?? ""}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Updating" : "Update Event"}
      </button>

      {/* Message */}
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}
