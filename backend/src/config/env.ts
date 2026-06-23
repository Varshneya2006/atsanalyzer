import dotenv from "dotenv";
dotenv.config();

function required(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  MONGO_URI: required("MONGO_URI"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",

  MAX_CONCURRENT_ANALYSES: parseInt(process.env.MAX_CONCURRENT_ANALYSES || "5", 10),
  MAX_CONCURRENT_AI_CALLS: parseInt(process.env.MAX_CONCURRENT_AI_CALLS || "3", 10),
  WORKER_POOL_SIZE: parseInt(process.env.WORKER_POOL_SIZE || "4", 10),
  QUEUE_RETRY_ATTEMPTS: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || "2", 10),
  QUEUE_RETRY_DELAY_MS: parseInt(process.env.QUEUE_RETRY_DELAY_MS || "500", 10),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@atsanalyzer.com",
};
