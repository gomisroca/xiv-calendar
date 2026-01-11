"use client";

import { useState } from "react";
import { createEvent } from "@/server/actions/events";
import { unwrap } from "@/utils/actions";

interface CreateEventFormProps {
  orgId: string;
}

export function CreateEventForm({ orgId }: CreateEventFormProps) {
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
        orgId,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block font-medium">Event Name</label>
        <input
          type="text"
          name="name"
          placeholder="Event name"
          className="input input-bordered w-full"
          required
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Start Date & Time</label>
        <input
          type="datetime-local"
          name="startsAt"
          className="input input-bordered w-full"
          required
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">
          End Date & Time (optional)
        </label>
        <input
          type="datetime-local"
          name="endsAt"
          className="input input-bordered w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Creating…" : "Create Event"}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}
