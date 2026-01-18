import NotFoundShell from "./_components/not-found-shell";

export default async function NotFound() {
  return (
    <NotFoundShell
      title="Page not found"
      description="The page you’re looking for doesn’t exist or was moved."
    />
  );
}
