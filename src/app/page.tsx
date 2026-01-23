import { auth } from "@/server/auth";
import Dashboard from "./dashboard";
import LoggedOutLanding from "./logged-out-landing";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();

  if (session?.user) {
    return <Dashboard searchParams={searchParams} />;
  }

  return <LoggedOutLanding />;
}
