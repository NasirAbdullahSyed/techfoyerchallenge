import { eq, and, or, ilike, asc, desc, sql, type SQL, type AnyColumn } from "drizzle-orm";
import type { SearchParams, CreateStateInput, UpdateStateInput } from "@repo/shared";
import { states, countries } from "../db/schema/index.js";
import type { DrizzleDB } from "../config/database.js";
import { AppError } from "../utils/api-error.js";

// ─── State Service ───────────────────────────────────────────────────
// Handles all business logic and CRUD operations for the State entity.

export class StateService {
  constructor(private db: DrizzleDB) {}

  // ─── Search with pagination, filtering, sorting ──────────────────

  async search(params: SearchParams) {
    const { query, isActive, page, pageSize, sortBy, sortOrder } = params;

    const conditions: SQL[] = [];

    // Search by code or name
    if (query) {
      conditions.push(
        or(
          ilike(states.name, `%${query}%`),
          ilike(states.code, `%${query}%`)
        )!
      );
    }

    // Filter by active status
    if (isActive !== "all") {
      conditions.push(eq(states.isActive, isActive === "active"));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * pageSize;

    // Get sort column safely
    const sortColumn = this.getSortColumn(sortBy);
    const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    // Execute data query (with country join) and count query in parallel
    const [data, countResult] = await Promise.all([
      this.db
        .select({
          id: states.id,
          code: states.code,
          name: states.name,
          isActive: states.isActive,
          countryId: states.countryId,
          createdAt: states.createdAt,
          updatedAt: states.updatedAt,
          country: {
            id: countries.id,
            code: countries.code,
            name: countries.name,
          },
        })
        .from(states)
        .leftJoin(countries, eq(states.countryId, countries.id))
        .where(where)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(states)
        .where(where),
    ]);

    const totalCount = countResult[0]?.count ?? 0;

    return {
      data,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  // ─── Get by ID (with country info) ──────────────────────────────

  async getById(id: number) {
    const result = await this.db
      .select({
        id: states.id,
        code: states.code,
        name: states.name,
        isActive: states.isActive,
        countryId: states.countryId,
        createdAt: states.createdAt,
        updatedAt: states.updatedAt,
        country: {
          id: countries.id,
          code: countries.code,
          name: countries.name,
        },
      })
      .from(states)
      .leftJoin(countries, eq(states.countryId, countries.id))
      .where(eq(states.id, id))
      .limit(1);

    if (result.length === 0) {
      throw AppError.notFound(`State with ID ${id} not found`);
    }

    return result[0];
  }

  // ─── Create ──────────────────────────────────────────────────────

  async create(input: CreateStateInput) {
    // Verify country exists
    const countryExists = await this.db
      .select({ id: countries.id })
      .from(countries)
      .where(eq(countries.id, input.countryId))
      .limit(1);

    if (countryExists.length === 0) {
      throw AppError.badRequest(`Country with ID ${input.countryId} does not exist`);
    }

    // Check for duplicate code within the same country
    const existing = await this.db
      .select()
      .from(states)
      .where(
        and(
          eq(states.code, input.code),
          eq(states.countryId, input.countryId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw AppError.conflict(`State with code "${input.code}" already exists in this country`);
    }

    const result = await this.db
      .insert(states)
      .values({
        code: input.code,
        name: input.name,
        isActive: input.isActive,
        countryId: input.countryId,
      })
      .returning();

    return result[0];
  }

  // ─── Update ──────────────────────────────────────────────────────

  async update(id: number, input: UpdateStateInput) {
    // Verify state exists
    await this.getById(id);

    // Verify country exists if countryId is being updated
    if (input.countryId) {
      const countryExists = await this.db
        .select({ id: countries.id })
        .from(countries)
        .where(eq(countries.id, input.countryId))
        .limit(1);

      if (countryExists.length === 0) {
        throw AppError.badRequest(`Country with ID ${input.countryId} does not exist`);
      }
    }

    // Check for duplicate code within the same country if code is being updated
    if (input.code) {
      // Determine the country scope for the check
      const currentState = await this.db
        .select({ countryId: states.countryId })
        .from(states)
        .where(eq(states.id, id))
        .limit(1);

      const scopeCountryId = input.countryId ?? currentState[0]?.countryId;

      const existing = await this.db
        .select()
        .from(states)
        .where(
          and(
            eq(states.code, input.code),
            eq(states.countryId, scopeCountryId),
            sql`${states.id} != ${id}`
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw AppError.conflict(`State with code "${input.code}" already exists in this country`);
      }
    }

    const result = await this.db
      .update(states)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(states.id, id))
      .returning();

    return result[0];
  }

  // ─── Delete (single) ────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    await this.getById(id); // Verify exists
    await this.db.delete(states).where(eq(states.id, id));
  }

  // ─── Bulk Delete ─────────────────────────────────────────────────

  async bulkDelete(ids: number[]): Promise<number> {
    const result = await this.db
      .delete(states)
      .where(sql`${states.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`)
      .returning({ id: states.id });

    return result.length;
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private getSortColumn(sortBy: string): AnyColumn {
    const columnMap: Record<string, AnyColumn> = {
      name: states.name,
      code: states.code,
      isActive: states.isActive,
      countryId: states.countryId,
      createdAt: states.createdAt,
      updatedAt: states.updatedAt,
    };
    return columnMap[sortBy] ?? states.name;
  }
}
