import Link from "next/link";

export default async function UnauthorizedPage() {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-black">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        🚫
      </div>

      <h1 className="text-2xl font-semibold">You don’t have access to this</h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        You’re signed in, but this page belongs to an organization you’re not
        part of.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <Link
          href="/"
          className="rounded-lg border px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
