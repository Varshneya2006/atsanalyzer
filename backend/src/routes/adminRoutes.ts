import { Router } from "express";
import * as adminController from "../controllers/adminController";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.deleteUser);
router.get("/reports", adminController.listAllReports);
router.get("/stats", adminController.usageStatistics);

export default router;
