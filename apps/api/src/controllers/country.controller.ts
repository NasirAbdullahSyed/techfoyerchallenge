import type { Request, Response, NextFunction } from "express";
import {
  searchParamsSchema,
  createCountrySchema,
  updateCountrySchema,
  bulkDeleteSchema,
} from "@repo/shared";
import { CountryService } from "../services/country.service.js";
import { ApiResponse } from "../utils/api-response.js";

// ─── Country Controller ──────────────────────────────────────────────
// Only handles request/response concerns. All business logic is in the service.

export class CountryController {
  constructor(private countryService: CountryService) {}

  // GET /api/countries/search
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = searchParamsSchema.parse(req.query);
      const result = await this.countryService.search(params);
      res.json(ApiResponse.ok(result.data, "Countries retrieved successfully", result.meta));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/countries/list
  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.countryService.list();
      res.json(ApiResponse.ok(data, "Countries list retrieved"));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/countries/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error("Invalid country ID"));
        return;
      }
      const data = await this.countryService.getById(id);
      res.json(ApiResponse.ok(data, "Country retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/countries
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createCountrySchema.parse(req.body);
      const data = await this.countryService.create(input);
      res.status(201).json(ApiResponse.created(data, "Country created successfully"));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/countries/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error("Invalid country ID"));
        return;
      }
      const input = updateCountrySchema.parse(req.body);
      const data = await this.countryService.update(id, input);
      res.json(ApiResponse.ok(data, "Country updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/countries/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error("Invalid country ID"));
        return;
      }
      await this.countryService.delete(id);
      res.json(ApiResponse.ok(null, "Country deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/countries/bulk-delete
  bulkDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = bulkDeleteSchema.parse(req.body);
      const deletedCount = await this.countryService.bulkDelete(ids);
      res.json(ApiResponse.ok({ deletedCount }, `${deletedCount} countries deleted successfully`));
    } catch (error) {
      next(error);
    }
  };
}
