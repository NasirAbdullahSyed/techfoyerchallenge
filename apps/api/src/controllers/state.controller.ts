import type { Request, Response, NextFunction } from "express";
import {
  searchParamsSchema,
  createStateSchema,
  updateStateSchema,
  bulkDeleteSchema,
} from "@repo/shared";
import { StateService } from "../services/state.service.js";
import { ApiResponse } from "../utils/api-response.js";

// ─── State Controller ────────────────────────────────────────────────
// Only handles request/response concerns. All business logic is in the service.

export class StateController {
  constructor(private stateService: StateService) {}

  // GET /api/states/search
  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = searchParamsSchema.parse(req.query);
      const result = await this.stateService.search(params);
      res.json(ApiResponse.ok(result.data, "States retrieved successfully", result.meta));
    } catch (error) {
      next(error);
    }
  };

  // GET /api/states/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error("Invalid state ID"));
        return;
      }
      const data = await this.stateService.getById(id);
      res.json(ApiResponse.ok(data, "State retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/states
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createStateSchema.parse(req.body);
      const data = await this.stateService.create(input);
      res.status(201).json(ApiResponse.created(data, "State created successfully"));
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/states/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error("Invalid state ID"));
        return;
      }
      const input = updateStateSchema.parse(req.body);
      const data = await this.stateService.update(id, input);
      res.json(ApiResponse.ok(data, "State updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/states/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        res.status(400).json(ApiResponse.error("Invalid state ID"));
        return;
      }
      await this.stateService.delete(id);
      res.json(ApiResponse.ok(null, "State deleted successfully"));
    } catch (error) {
      next(error);
    }
  };

  // POST /api/states/bulk-delete
  bulkDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = bulkDeleteSchema.parse(req.body);
      const deletedCount = await this.stateService.bulkDelete(ids);
      res.json(ApiResponse.ok({ deletedCount }, `${deletedCount} states deleted successfully`));
    } catch (error) {
      next(error);
    }
  };
}
