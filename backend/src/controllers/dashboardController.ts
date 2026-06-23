import { Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/apiError";
import { AuthedRequest } from "../middlewares/authMiddleware";
import { Analysis } from "../models/Analysis";
import { Resume } from "../models/Resume";

export const getDashboardSummary = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const [totals, bestScore, resumeCount, history, monthly] = await Promise.all([
    Analysis.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: 1 }, avgScore: { $avg: "$score" } } },
    ]),
    Analysis.findOne({ user: userId, status: "completed" }).sort({ score: -1 }).select("score createdAt"),
    Resume.countDocuments({ user: userId }),
    Analysis.find({ user: userId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("score createdAt"),
    Analysis.aggregate([
      { $match: { user: userId, status: "completed" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    summary: {
      totalAnalyses: totals[0]?.total || 0,
      averageScore: totals[0]?.avgScore ? Math.round(totals[0].avgScore) : 0,
      bestScore: bestScore?.score || 0,
      resumeUploadCount: resumeCount,
      scoreHistory: history.reverse().map((a) => ({ date: a.createdAt, score: a.score })),
      monthlyAnalyses: monthly.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        count: m.count,
      })),
    },
  });
});

export const getSkillBreakdown = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);

  const analyses = await Analysis.find({ user: userId, status: "completed" }).select("missingKeywords");
  const freq = new Map<string, number>();

  for (const a of analyses) {
    for (const kw of a.missingKeywords) {
      freq.set(kw, (freq.get(kw) || 0) + 1);
    }
  }

  const breakdown = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  res.status(200).json({ success: true, breakdown });
});
