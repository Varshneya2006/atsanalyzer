import { Response } from "express";
import { asyncHandler, ApiError } from "../utils/apiError";
import { AuthedRequest } from "../middlewares/authMiddleware";
import { Resume } from "../models/Resume";
import { Analysis } from "../models/Analysis";
import { runAnalysisPipeline, getPipelineStats } from "../services/analysisPipeline";

export const createAnalysisHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { resumeId, jobDescription } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, user: req.user!.userId });
  if (!resume) throw new ApiError(404, "Resume not found. Upload a resume before requesting an analysis.");

  const analysisDoc = await Analysis.create({
    user: req.user!.userId,
    resume: resume._id,
    jobDescription,
    status: "processing",
  });

  try {
    const result = await runAnalysisPipeline(resume.rawText, jobDescription);

    analysisDoc.status = "completed";
    analysisDoc.score = result.atsResult.score;
    analysisDoc.missingKeywords = result.atsResult.missingKeywords;
    analysisDoc.strengths = result.atsResult.strengths;
    analysisDoc.weaknesses = result.atsResult.weaknesses;
    analysisDoc.aiFeedback = result.aiFeedback;
    analysisDoc.processingTimeMs = result.processingTimeMs;
    analysisDoc.sectionFeedback = {
      skills: `${result.parsedResume.skills.length} skills detected`,
      experience: `${result.parsedResume.experience.length} experience lines detected`,
      education: result.parsedResume.education.length > 0 ? "Education section found" : "No education section detected",
      projects: result.parsedResume.projects.length > 0 ? "Projects section found" : "No projects section detected",
      formatting: `Breakdown: ${JSON.stringify(result.atsResult.breakdown)}`,
    };
    await analysisDoc.save();

    res.status(200).json({ success: true, analysis: analysisDoc });
  } catch (err) {
    analysisDoc.status = "failed";
    analysisDoc.error = (err as Error).message;
    await analysisDoc.save();
    throw new ApiError(500, "Analysis pipeline failed", { analysisId: analysisDoc._id });
  }
});

export const listAnalysesHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const analyses = await Analysis.find({ user: req.user!.userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, analyses });
});

export const getAnalysisHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user!.userId });
  if (!analysis) throw new ApiError(404, "Analysis not found");
  res.status(200).json({ success: true, analysis });
});

export const pipelineStatsHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.status(200).json({ success: true, stats: getPipelineStats() });
});
