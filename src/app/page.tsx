import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import LandingPage from "./landing";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
