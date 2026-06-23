import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`[server] ATS Analyzer API running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[server] Worker pool size: ${env.WORKER_POOL_SIZE}, max concurrent analyses: ${env.MAX_CONCURRENT_ANALYSES}`);
  });

  process.on("SIGTERM", () => {
    console.log("[server] SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
