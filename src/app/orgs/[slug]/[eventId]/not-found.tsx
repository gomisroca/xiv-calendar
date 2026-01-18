import NotFoundShell from "@/app/_components/not-found-shell";

export default async function NotFound() {
  return (
    <NotFoundShell
      title="Event not found"
      description="The event you’re looking for doesn’t exist."
    />
  );
}
