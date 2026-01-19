import Link from "next/link";

export default async function UnauthorizedShell({
  title = "Access denied",
  description = "You don’t have permission to view this page.",
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-black">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        🚫
      </div>

      <h1 className="text-2xl font-semibold">{title}</h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <div className="mt-10 flex flex-col items-center gap-4">
        <Link
          href={backHref}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {backLabel}
        </Link>

        <Link
          href="/"
          className="rounded-lg border px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
