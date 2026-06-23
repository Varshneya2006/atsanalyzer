import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  originalFileName: string;
  fileType: "pdf" | "docx";
  rawText: string;
  parsed: {
    skills: string[];
    experience: string[];
    education: string[];
    certifications: string[];
    projects: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalFileName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "docx"], required: true },
    rawText: { type: String, required: true },
    parsed: {
      skills: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      education: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      projects: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

export const Resume: Model<IResume> = mongoose.model<IResume>("Resume", resumeSchema);
