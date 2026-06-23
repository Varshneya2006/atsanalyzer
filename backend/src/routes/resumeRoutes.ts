import { Router } from "express";
import * as resumeController from "../controllers/resumeController";
import { requireAuth } from "../middlewares/authMiddleware";
import { uploadResume } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/upload", requireAuth, uploadResume, resumeController.uploadResumeHandler);
router.get("/", requireAuth, resumeController.listResumesHandler);
router.get("/:id", requireAuth, resumeController.getResumeHandler);

export default router;
