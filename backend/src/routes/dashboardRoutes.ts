import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.get("/summary", requireAuth, dashboardController.getDashboardSummary);
router.get("/skill-breakdown", requireAuth, dashboardController.getSkillBreakdown);

export default router;
