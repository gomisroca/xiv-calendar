export class AppError extends Error {
  constructor(
    public message: string,
    public code: "UNAUTHORIZED" | "DUPLICATE" | "UNKNOWN" = "UNKNOWN",
  ) {
    super(message);
  }
}
