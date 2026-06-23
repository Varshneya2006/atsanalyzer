import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import { User } from "../models/User";

export interface AuthedRequest extends Request {
  user?: { userId: string; role: "user" | "admin" };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or malformed Authorization header");
    }

    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select("_id role isActive");
    if (!user || !user.isActive) {
      throw new ApiError(401, "User not found or deactivated");
    }

    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired access token"));
  }
}

export function requireRole(...roles: Array<"user" | "admin">) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "Insufficient permissions"));
      return;
    }
    next();
  };
}
