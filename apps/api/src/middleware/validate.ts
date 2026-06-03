import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

// ─── Zod Validation Middleware ───────────────────────────────────────

export const validate = (schema: ZodSchema, source: "body" | "query" = "body") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
};
