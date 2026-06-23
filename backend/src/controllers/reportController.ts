import { Response } from "express";
import { asyncHandler, ApiError } from "../utils/apiError";
import { AuthedRequest } from "../middlewares/authMiddleware";
import { Analysis } from "../models/Analysis";
import { Report } from "../models/Report";

export const generateReport = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const analysis = await Analysis.findOne({ _id: req.params.analysisId, user: req.user!.userId });
  if (!analysis) throw new ApiError(404, "Analysis not found");
  if (analysis.status !== "completed") throw new ApiError(400, "Analysis is not yet completed");

  const report = await Report.create({
    user: req.user!.userId,
    analysis: analysis._id,
    format: "json",
  });

  const payload = {
    reportId: report._id,
    generatedAt: report.generatedAt,
    score: analysis.score,
    missingKeywords: analysis.missingKeywords,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    sectionFeedback: analysis.sectionFeedback,
    aiFeedback: analysis.aiFeedback,
    processingTimeMs: analysis.processingTimeMs,
  };

  res.setHeader("Content-Disposition", `attachment; filename="ats-report-${analysis._id}.json"`);
  res.status(200).json(payload);
});

export const listReports = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const reports = await Report.find({ user: req.user!.userId }).populate("analysis").sort({ generatedAt: -1 });
  res.status(200).json({ success: true, reports });
});
