import { eq, and, or, ilike, asc, desc, sql, type SQL, type AnyColumn } from "drizzle-orm";
import type { SearchParams, CreateCountryInput, UpdateCountryInput } from "@repo/shared";
import { countries } from "../db/schema/index.js";
import type { DrizzleDB } from "../config/database.js";
import type { CountrySelect } from "../db/schema/index.js";
import { AppError } from "../utils/api-error.js";

// ─── Country Service ─────────────────────────────────────────────────
// Handles all business logic and CRUD operations for the Country entity.

export class CountryService {
  constructor(private db: DrizzleDB) {}

  // ─── Search with pagination, filtering, sorting ──────────────────

  async search(params: SearchParams) {
    const { query, isActive, page, pageSize, sortBy, sortOrder } = params;

    const conditions: SQL[] = [];

    // Search by code or name
    if (query) {
      conditions.push(
        or(
          ilike(countries.name, `%${query}%`),
          ilike(countries.code, `%${query}%`)
        )!
      );
    }

    // Filter by active status
    if (isActive !== "all") {
      conditions.push(eq(countries.isActive, isActive === "active"));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * pageSize;

    // Get sort column safely
    const sortColumn = this.getSortColumn(sortBy);
    const orderBy = sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    // Execute data query and count query in parallel
    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(countries)
        .where(where)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(countries)
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

  // ─── Get all countries (for dropdowns, no pagination) ────────────

  async list(): Promise<CountrySelect[]> {
    return this.db
      .select()
      .from(countries)
      .where(eq(countries.isActive, true))
      .orderBy(asc(countries.name));
  }

  // ─── Get by ID ───────────────────────────────────────────────────

  async getById(id: number): Promise<CountrySelect> {
    const result = await this.db
      .select()
      .from(countries)
      .where(eq(countries.id, id))
      .limit(1);

    if (result.length === 0) {
      throw AppError.notFound(`Country with ID ${id} not found`);
    }

    return result[0];
  }

  // ─── Create ──────────────────────────────────────────────────────

  async create(input: CreateCountryInput): Promise<CountrySelect> {
    // Check for duplicate code
    const existing = await this.db
      .select()
      .from(countries)
      .where(eq(countries.code, input.code))
      .limit(1);

    if (existing.length > 0) {
      throw AppError.conflict(`Country with code "${input.code}" already exists`);
    }

    const result = await this.db
      .insert(countries)
      .values({
        code: input.code,
        name: input.name,
        isActive: input.isActive,
      })
      .returning();

    return result[0];
  }

  // ─── Update ──────────────────────────────────────────────────────

  async update(id: number, input: UpdateCountryInput): Promise<CountrySelect> {
    // Verify it exists
    await this.getById(id);

    // Check for duplicate code if code is being updated
    if (input.code) {
      const existing = await this.db
        .select()
        .from(countries)
        .where(and(eq(countries.code, input.code), sql`${countries.id} != ${id}`))
        .limit(1);

      if (existing.length > 0) {
        throw AppError.conflict(`Country with code "${input.code}" already exists`);
      }
    }

    const result = await this.db
      .update(countries)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(countries.id, id))
      .returning();

    return result[0];
  }

  // ─── Delete (single) ────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    await this.getById(id); // Verify exists
    await this.db.delete(countries).where(eq(countries.id, id));
  }

  // ─── Bulk Delete ─────────────────────────────────────────────────

  async bulkDelete(ids: number[]): Promise<number> {
    const result = await this.db
      .delete(countries)
      .where(sql`${countries.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`)
      .returning({ id: countries.id });

    return result.length;
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private getSortColumn(sortBy: string): AnyColumn {
    const columnMap: Record<string, AnyColumn> = {
      name: countries.name,
      code: countries.code,
      isActive: countries.isActive,
      createdAt: countries.createdAt,
      updatedAt: countries.updatedAt,
    };
    return columnMap[sortBy] ?? countries.name;
  }
}
