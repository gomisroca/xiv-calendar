"use client";

import { createOrganization } from "@/server/actions/organizations";
import { AppError } from "@/utils/errors";
import { useState } from "react";

export default function CreateOrganizationForm() {
  const [message, setMessage] = useState<{
    content: string;
    error?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();

    try {
      const res = await createOrganization({ name });
      setMessage({ content: res.message });
      e.currentTarget.reset();
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setMessage({ content: err.message, error: true });
      } else {
        setMessage({ content: "Unexpected error", error: true });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 rounded bg-white p-4 shadow"
    >
      <div>
        <label htmlFor="name" className="mb-1 block font-medium">
          Organization Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full rounded border px-3 py-2 focus:border-blue-300 focus:ring focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Organization"}
      </button>

      {message && (
        <p
          className={`${message.error ? "text-red-600" : "text-green-600"} mt-2`}
        >
          {message.content}
        </p>
      )}
    </form>
  );
}
