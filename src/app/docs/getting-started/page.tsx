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
        <span className="h-4 w-4 rounded-full bg-indigo-600 dark:bg-indigo-400" />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Step {number}
        </span>
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
        📖
      </div>
      <h1 className="text-2xl font-semibold">Getting started</h1>
      <p className="my-2 text-sm text-slate-500 dark:text-slate-400">
        Follow these steps to get started with XIV Calendar.
      </p>
      <div className="grid grid-cols-2">
        <div className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">User Guide</h3>
          <Step number={1} description="Sign in via Discord." />
          <Step number={2} description="Browse and join organizations." />
          <Step
            number={3}
            description="RSVP to events in any of your organizations."
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Organizer Guide</h3>
          <Step number={1} description="Create an organization." />
          <Step
            number={2}
            description="Customize the organization and assign roles to members."
          />
          <Step
            number={3}
            description="Post events to the organization's calendar and Discord."
          />
        </div>
      </div>
    </div>
  );
}
