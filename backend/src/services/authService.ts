import crypto from "crypto";
import { User, IUser } from "../models/User";
import { Token } from "../models/Token";
import { ApiError } from "../utils/apiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken, refreshExpiryDate } from "../utils/jwt";

export async function registerUser(name: string, email: string, password: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password });
  return issueTokenPair(user);
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive) throw new ApiError(401, "Invalid email or password");

  const valid = await user.comparePassword(password);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  return issueTokenPair(user);
}

async function issueTokenPair(user: IUser) {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await Token.create({
    user: user._id,
    token: refreshToken,
    type: "refresh",
    expiresAt: refreshExpiryDate(),
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const stored = await Token.findOne({ token: refreshToken, type: "refresh", revoked: false });
  if (!stored) throw new ApiError(401, "Refresh token not recognized or revoked");

  const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
  return { accessToken };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await Token.updateOne({ token: refreshToken, type: "refresh" }, { revoked: true });
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const user = await User.findOne({ email });
  if (!user) return null; // do not leak account existence

  const resetToken = crypto.randomBytes(32).toString("hex");
  await Token.create({
    user: user._id,
    token: resetToken,
    type: "reset",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  return resetToken; // in production: email this link, don't return it to caller
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const stored = await Token.findOne({ token, type: "reset", revoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }

  const user = await User.findById(stored.user);
  if (!user) throw new ApiError(404, "User not found");

  user.password = newPassword;
  await user.save();

  stored.revoked = true;
  await stored.save();
}
