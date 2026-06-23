import { Router } from "express";
import * as reportController from "../controllers/reportController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/:analysisId", requireAuth, reportController.generateReport);
router.get("/", requireAuth, reportController.listReports);

export default router;
