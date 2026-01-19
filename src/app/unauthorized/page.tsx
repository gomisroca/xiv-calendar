import UnauthorizedShell from "@/app/_components/unauthorized-shell";

export default function UnauthorizedPage() {
  return (
    <UnauthorizedShell
      title="You don’t have access to this"
      description="You’re signed in, but this page belongs to an organization you’re not part of."
    />
  );
}
