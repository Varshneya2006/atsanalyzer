import mongoose, { Schema, Document, Model } from "mongoose";

export type TokenType = "refresh" | "reset";

export interface IToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  type: TokenType;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: ["refresh", "reset"], required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index: Mongo auto-deletes expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token: Model<IToken> = mongoose.model<IToken>("Token", tokenSchema);
