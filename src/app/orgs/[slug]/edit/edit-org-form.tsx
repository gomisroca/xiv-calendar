"use client";

import { updateOrganization } from "@/server/actions/organizations";
import { unwrap } from "@/utils/actions";
import { useState } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import type { Organization } from "generated/prisma";
import Image from "next/image";

interface EditOrganizationFormProps {
  org: Organization;
}

export default function EditOrganizationForm({
  org,
}: EditOrganizationFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { startUpload } = useUploadThing("projectPicture");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    let picture = org.image ?? null;

    // Upload media if files are provided
    if (file) {
      const data = await startUpload([file]);
      if (!data?.[0]) return;
      picture = data[0]?.ufsUrl;
    }

    const name = (formData.get("name") as string)?.trim();
    const discordChannelId = (
      formData.get("discordChannelId") as string
    )?.trim();
    const description = (formData.get("description") as string) ?? "";
    const hidden = formData.get("hidden") === "on";

    try {
      const result = await updateOrganization(org.id, {
        name,
        discordChannelId,
        description,
        picture,
        hidden,
      });

      const message = unwrap(result);
      setMessage(message);

      form.reset();
      setFile(null);
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
      {/* Organization name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Organization name
        </label>
        <input
          type="text"
          name="name"
          defaultValue={org.name}
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
          defaultValue={org.discordChannelId ?? ""}
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <input
          type="text"
          name="description"
          defaultValue={org.description ?? ""}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Picture */}
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Organization Picture
        </label>
        {org.image && !file && (
          <div className="flex items-center gap-4">
            <Image
              src={org.image}
              alt={`${org.name} picture`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
            />
            <span className="text-sm text-slate-500">Current picture</span>
          </div>
        )}

        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setFile(file);
          }}
          name="imageFile"
          accept="image/*"
          multiple={false}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Private */}
      <div className="flex gap-4">
        <label className="mb-1.5 block text-sm font-medium">
          Private Organization
        </label>
        <input
          type="checkbox"
          name="hidden"
          defaultChecked={org.private}
          className="w-20 rounded-lg border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-slate-800 dark:bg-black"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Updating" : "Update Organization"}
      </button>

      {/* Message */}
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}
