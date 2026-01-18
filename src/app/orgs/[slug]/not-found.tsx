import NotFoundShell from "@/app/_components/not-found-shell";

export default async function NotFound() {
  return (
    <NotFoundShell
      title="Organization not found"
      description="This organization may have been deleted or you don’t have access to it."
    />
  );
}
