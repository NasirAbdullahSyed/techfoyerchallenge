import { Router, type Router as RouterType } from "express";
import { StateController } from "../controllers/state.controller.js";
import { StateService } from "../services/state.service.js";
import { db } from "../config/database.js";

// ─── Dependency Injection ────────────────────────────────────────────
const stateService = new StateService(db);
const stateController = new StateController(stateService);

// ─── Routes ──────────────────────────────────────────────────────────
const router: RouterType = Router();

router.get("/search", stateController.search);
router.get("/:id", stateController.getById);
router.post("/", stateController.create);
router.post("/bulk-delete", stateController.bulkDelete);
router.put("/:id", stateController.update);
router.delete("/:id", stateController.delete);

export const stateRoutes: RouterType = router;
