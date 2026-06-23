import { Router } from "express";
import * as authController from "../controllers/authController";
import { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } from "../validators/authValidators";
import { validate } from "../middlewares/validateMiddleware";
import { requireAuth } from "../middlewares/authMiddleware";
import { authRateLimiter } from "../middlewares/rateLimitMiddleware";

const router = Router();

router.post("/register", authRateLimiter, registerValidator, validate, authController.register);
router.post("/login", authRateLimiter, loginValidator, validate, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authRateLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post("/reset-password", authRateLimiter, resetPasswordValidator, validate, authController.resetPassword);

router.get("/profile", requireAuth, authController.getProfile);
router.patch("/profile", requireAuth, authController.updateProfile);

export default router;
