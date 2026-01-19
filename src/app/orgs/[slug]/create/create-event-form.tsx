"use client";

import { useState } from "react";
import { createEvent } from "@/server/actions/events";
import { unwrap } from "@/utils/actions";
import type { Organization } from "generated/prisma";

interface CreateEventFormProps {
  org: Organization;
}

export function CreateEventForm({ org }: CreateEventFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = (formData.get("name") as string)?.trim();
    const startsAt = formData.get("startsAt") as string;
    const endsAt = formData.get("endsAt") as string | null;

    try {
      const result = await createEvent({
        orgId: org.id,
        discordChannelId: org.discordChannelId,
        name: title,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : undefined,
      });

      const message = unwrap(result);
      setMessage(message);

      form.reset();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong creating the event",
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
          placeholder="Friday Game Night"
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
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create event"}
      </button>

      {/* Message */}
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}
