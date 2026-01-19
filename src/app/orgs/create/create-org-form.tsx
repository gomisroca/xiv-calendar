"use client";

import { createOrganization } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";
import { useState } from "react";

export default function CreateOrganizationForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string)?.trim();
    const discordChannelId = (
      formData.get("discordChannelId") as string
    )?.trim();

    try {
      const result = await createOrganization({ name, discordChannelId });

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
      {/* Organization name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Organization name
        </label>
        <input
          type="text"
          name="name"
          placeholder="Dungeon Crawlers"
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Discord channel ID */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Discord Channel ID
        </label>
        <input
          type="text"
          name="discordChannelId"
          placeholder="1123456789"
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create Organization"}
      </button>

      {/* Message */}
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}
