import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// ─── Global Error Handler Middleware ─────────────────────────────────

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(ApiResponse.error(err.message));
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    res.status(400).json(ApiResponse.error(message));
    return;
  }

  // Unknown / unexpected errors → HTTP 500
  res.status(500).json(ApiResponse.error("Internal server error"));
};
