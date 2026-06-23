import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
// @ts-ignore - xss-clean has no types
import xssClean from "xss-clean";

import { env } from "./config/env";
import { generalRateLimiter } from "./middlewares/rateLimitMiddleware";
import { notFoundHandler, errorHandler } from "./middlewares/errorMiddleware";

import authRoutes from "./routes/authRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import analysisRoutes from "./routes/analysisRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import adminRoutes from "./routes/adminRoutes";
import reportRoutes from "./routes/reportRoutes";

const app: Application = express();

// --- Security & utility middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL || "http://localhost:5173", // Fallback ensures your local Vite dev server can connect
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xssClean());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(generalRateLimiter);

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

// --- Fallback handlers ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;