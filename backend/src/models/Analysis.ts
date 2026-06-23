import mongoose, { Schema, Document, Model } from "mongoose";

export type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

export interface IAnalysis extends Document {
  user: mongoose.Types.ObjectId;
  resume: mongoose.Types.ObjectId;
  jobDescription: string;
  status: AnalysisStatus;
  score: number;
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  sectionFeedback: {
    skills: string;
    experience: string;
    education: string;
    projects: string;
    formatting: string;
  };
  aiFeedback: {
    summary: string;
    missingSkills: string[];
    improvementSuggestions: string[];
    interviewTips: string[];
    jobMatchAnalysis: string;
  };
  processingTimeMs: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    jobDescription: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    score: { type: Number, min: 0, max: 100, default: 0 },
    missingKeywords: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    sectionFeedback: {
      skills: { type: String, default: "" },
      experience: { type: String, default: "" },
      education: { type: String, default: "" },
      projects: { type: String, default: "" },
      formatting: { type: String, default: "" },
    },
    aiFeedback: {
      summary: { type: String, default: "" },
      missingSkills: { type: [String], default: [] },
      improvementSuggestions: { type: [String], default: [] },
      interviewTips: { type: [String], default: [] },
      jobMatchAnalysis: { type: String, default: "" },
    },
    processingTimeMs: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: true }
);

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ user: 1, score: -1 });

export const Analysis: Model<IAnalysis> = mongoose.model<IAnalysis>("Analysis", analysisSchema);
