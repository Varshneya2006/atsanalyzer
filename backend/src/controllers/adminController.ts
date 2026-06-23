import { Response } from "express";
import { asyncHandler, ApiError } from "../utils/apiError";
import { AuthedRequest } from "../middlewares/authMiddleware";
import { User } from "../models/User";
import { Analysis } from "../models/Analysis";
import { Resume } from "../models/Resume";
import { getPipelineStats } from "../services/analysisPipeline";

export const listUsers = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "20", 10);

  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
});

export const deleteUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "admin") throw new ApiError(403, "Cannot delete an admin account");

  await Promise.all([
    User.findByIdAndDelete(req.params.id),
    Resume.deleteMany({ user: req.params.id }),
    Analysis.deleteMany({ user: req.params.id }),
  ]);

  res.status(200).json({ success: true, message: "User and associated data deleted" });
});

export const listAllReports = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const analyses = await Analysis.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({ success: true, analyses });
});

export const usageStatistics = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const [userCount, analysisCount, resumeCount, avgScoreAgg] = await Promise.all([
    User.countDocuments(),
    Analysis.countDocuments(),
    Resume.countDocuments(),
    Analysis.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      userCount,
      analysisCount,
      resumeCount,
      averageScore: avgScoreAgg[0]?.avg ? Math.round(avgScoreAgg[0].avg) : 0,
      pipeline: getPipelineStats(),
    },
  });
});
