import { Response } from "express";
import { asyncHandler } from "../utils/apiError";
import { AuthedRequest } from "../middlewares/authMiddleware";
import * as authService from "../services/authService";
import { User } from "../models/User";
import { env } from "../config/env";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password);

  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({ success: true, accessToken: result.accessToken, user: result.user });
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);

  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, accessToken: result.accessToken, user: result.user });
});

export const refresh = asyncHandler(async (req, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token provided" });

  const result = await authService.refreshAccessToken(token);
  res.status(200).json({ success: true, accessToken: result.accessToken });
});

export const logout = asyncHandler(async (req, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (token) await authService.logoutUser(token);

  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const forgotPassword = asyncHandler(async (req, res: Response) => {
  const { email } = req.body;
  const resetToken = await authService.requestPasswordReset(email);

  // In production this token is emailed, never returned in the response.
  // Returned here only to make the flow testable end-to-end without an email provider configured.
  res.status(200).json({
    success: true,
    message: "If an account exists for this email, a reset link has been sent.",
    ...(env.NODE_ENV !== "production" && resetToken ? { devResetToken: resetToken } : {}),
  });
});

export const resetPassword = asyncHandler(async (req, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.status(200).json({ success: true, message: "Password reset successfully" });
});

export const getProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.user!.userId).select("-password");
  res.status(200).json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(req.user!.userId, { name }, { new: true }).select("-password");
  res.status(200).json({ success: true, user });
});
