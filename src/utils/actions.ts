export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ActionErrorCode };

export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "DUPLICATE"
  | "UNKNOWN";

export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
