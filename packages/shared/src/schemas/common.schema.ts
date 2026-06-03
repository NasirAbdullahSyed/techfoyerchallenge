import { z } from "zod";

// ─── Search / Pagination Params ──────────────────────────────────────

export const searchParamsSchema = z.object({
  query: z.string().optional().default(""),
  isActive: z.enum(["all", "active", "inactive"]).optional().default("all"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// ─── Bulk Delete Schema ──────────────────────────────────────────────

export const bulkDeleteSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, "At least one ID is required"),
});

export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
