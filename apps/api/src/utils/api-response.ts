import type { PaginationMeta } from "@repo/shared";

// ─── Standard API Response ───────────────────────────────────────────

export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data: T | null;
  public meta?: PaginationMeta;

  constructor(
    success: boolean,
    message: string,
    data: T | null = null,
    meta?: PaginationMeta
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static ok<T>(data: T, message = "Success", meta?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse(true, message, data, meta);
  }

  static created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message: string): ApiResponse<null> {
    return new ApiResponse(false, message, null);
  }
}
