import Link from "next/link";

function Step({
  number,
  description,
}: {
  number: number;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white dark:bg-indigo-400 dark:text-black">
          {number}
        </div>
      </div>
      <p className="text-start text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default async function GettingStartedPage() {
  return (
    <div className="w-full max-w-xl rounded-xl bg-white p-8 text-center shadow-sm dark:bg-black">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <span aria-hidden>📖</span>
      </div>
      <h1 className="text-2xl font-semibold">Getting started</h1>
      <p className="my-2 text-sm text-slate-500 dark:text-slate-400">
        Follow these steps to get started with XIV Calendar.
      </p>
      <h3 className="mt-6 text-sm font-medium tracking-wide text-slate-400 uppercase">
        Choose your path
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-start gap-3 rounded-lg bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-white/5">
          <h3 className="text-lg font-semibold uppercase">User</h3>
          <Step number={1} description="Sign in via Discord." />
          <Step number={2} description="Browse and join organizations." />
          <Step
            number={3}
            description="RSVP to events in any of your organizations."
          />
        </div>
        <div className="flex flex-col items-start gap-3 rounded-lg bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-white/5">
          <h3 className="text-lg font-semibold uppercase">Organizer</h3>
          <Step number={1} description="Create an organization." />
          <Step
            number={2}
            description="Customize the organization and assign roles to members."
          />
          <Step
            number={3}
            description="Post events to the organization's calendar and Discord."
          />
          <p className="border-t pt-2 text-start text-sm text-slate-500 dark:text-slate-400">
            For more information, please check out the
            <Link
              href="/docs/organizers"
              className="ml-1 text-black underline dark:text-white"
            >
              Organizer’s Handbook
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
