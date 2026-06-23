import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
  user: mongoose.Types.ObjectId;
  analysis: mongoose.Types.ObjectId;
  format: "pdf" | "json";
  filePath?: string;
  generatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    analysis: { type: Schema.Types.ObjectId, ref: "Analysis", required: true },
    format: { type: String, enum: ["pdf", "json"], default: "pdf" },
    filePath: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Report: Model<IReport> = mongoose.model<IReport>("Report", reportSchema);
