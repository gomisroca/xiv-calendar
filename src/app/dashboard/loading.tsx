export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-96 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Main card */}
      <div className="rounded-xl border bg-white p-8 shadow-sm dark:bg-black">
        <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />

        <div className="mt-6 flex gap-3">
          <div className="h-10 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
