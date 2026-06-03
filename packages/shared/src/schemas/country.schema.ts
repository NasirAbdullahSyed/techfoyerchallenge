import { z } from "zod";

// ─── Country Schemas ─────────────────────────────────────────────────

export const createCountrySchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be at most 10 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  isActive: z.boolean().default(true),
});

export const updateCountrySchema = createCountrySchema.partial();

export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;

// ─── Country Response Type ───────────────────────────────────────────

export interface Country {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
