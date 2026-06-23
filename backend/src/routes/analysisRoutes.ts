import { Router } from "express";
import * as analysisController from "../controllers/analysisController";
import { requireAuth } from "../middlewares/authMiddleware";
import { createAnalysisValidator } from "../validators/analysisValidators";
import { validate } from "../middlewares/validateMiddleware";
import { analysisRateLimiter } from "../middlewares/rateLimitMiddleware";

const router = Router();

router.post("/", requireAuth, analysisRateLimiter, createAnalysisValidator, validate, analysisController.createAnalysisHandler);
router.get("/", requireAuth, analysisController.listAnalysesHandler);
router.get("/stats/pipeline", requireAuth, analysisController.pipelineStatsHandler);
router.get("/:id", requireAuth, analysisController.getAnalysisHandler);

export default router;
