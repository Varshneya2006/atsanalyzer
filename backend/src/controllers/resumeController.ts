import { Response } from "express";
import { asyncHandler, ApiError } from "../utils/apiError";
import { AuthedRequest } from "../middlewares/authMiddleware";
import { Resume } from "../models/Resume";
import { User } from "../models/User";
import { detectFileType, extractTextFromFile } from "../services/fileExtractionService";

export const uploadResumeHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.file) throw new ApiError(400, "No resume file uploaded");

  const fileType = detectFileType(req.file.mimetype, req.file.originalname);
  const rawText = await extractTextFromFile(req.file.buffer, fileType);

  if (rawText.length < 50) {
    throw new ApiError(422, "Could not extract meaningful text from this file. Try a different format.");
  }

  const resume = await Resume.create({
    user: req.user!.userId,
    originalFileName: req.file.originalname,
    fileType,
    rawText,
    parsed: { skills: [], experience: [], education: [], certifications: [], projects: [] },
  });

  await User.findByIdAndUpdate(req.user!.userId, { $inc: { resumeUploadCount: 1 } });

  res.status(201).json({
    success: true,
    resume: { id: resume._id, fileName: resume.originalFileName, fileType: resume.fileType },
  });
});

export const listResumesHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const resumes = await Resume.find({ user: req.user!.userId })
    .select("originalFileName fileType createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, resumes });
});

export const getResumeHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user!.userId });
  if (!resume) throw new ApiError(404, "Resume not found");
  res.status(200).json({ success: true, resume });
});
