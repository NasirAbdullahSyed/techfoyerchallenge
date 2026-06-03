import { Router, type Router as RouterType } from "express";
import { CountryController } from "../controllers/country.controller.js";
import { CountryService } from "../services/country.service.js";
import { db } from "../config/database.js";

// ─── Dependency Injection ────────────────────────────────────────────
const countryService = new CountryService(db);
const countryController = new CountryController(countryService);

// ─── Routes ──────────────────────────────────────────────────────────
const router: RouterType = Router();

router.get("/search", countryController.search);
router.get("/list", countryController.list);
router.get("/:id", countryController.getById);
router.post("/", countryController.create);
router.post("/bulk-delete", countryController.bulkDelete);
router.put("/:id", countryController.update);
router.delete("/:id", countryController.delete);

export const countryRoutes: RouterType = router;
