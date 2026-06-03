import { z } from "zod";

// ─── State Schemas ───────────────────────────────────────────────────

export const createStateSchema = z.object({
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
  countryId: z.coerce
    .number()
    .int("Country ID must be an integer")
    .positive("Country ID must be a positive number"),
});

export const updateStateSchema = createStateSchema.partial();

export type CreateStateInput = z.infer<typeof createStateSchema>;
export type UpdateStateInput = z.infer<typeof updateStateSchema>;

// ─── State Response Type ─────────────────────────────────────────────

export interface State {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  countryId: number;
  createdAt: string;
  updatedAt: string;
  country?: {
    id: number;
    code: string;
    name: string;
  };
}
