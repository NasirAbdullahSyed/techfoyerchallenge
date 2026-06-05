// ─── Schemas ─────────────────────────────────────────────────────────
export {
  createCountrySchema,
  updateCountrySchema,
  type CreateCountryInput,
  type UpdateCountryInput,
  type Country,
} from "./schemas/country.schema.js";

export {
  createStateSchema,
  updateStateSchema,
  type CreateStateInput,
  type UpdateStateInput,
  type State,
} from "./schemas/state.schema.js";

export {
  searchParamsSchema,
  bulkDeleteSchema,
  type SearchParams,
  type BulkDeleteInput,
} from "./schemas/common.schema.js";

// ─── Types ───────────────────────────────────────────────────────────
export { type APIResponse, type PaginationMeta } from "./types/api-response.js";
