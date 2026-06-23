import { WorkerPool } from "./concurrency/WorkerPool";
import { TaskQueue } from "./concurrency/TaskQueue";
import { generateAiFeedback, AiFeedback } from "./aiService";
import { env } from "../config/env";

/**
 * ============================================================================
 * CONCURRENCY ARCHITECTURE — read this before touching this file.
 * ============================================================================
 *
 * An analysis request has four logical units of work:
 *   1. Resume parsing        (CPU-bound: regex/section extraction)
 *   2. Job description parsing (CPU-bound: keyword/skill extraction)
 *   3. ATS scoring            (CPU-bound: weighted scoring math)
 *   4. AI feedback generation (I/O-bound: network call to Gemini)
 *
 * These are NOT run with a single flat `Promise.all([...])`. That pattern only
 * controls *ordering*, not *resource usage* — it doesn't stop 200 simultaneous
 * requests from spawning 200 simultaneous Gemini calls (rate-limit risk) or
 * 200 CPU-bound parses fighting over Node's single JS thread (latency spikes).
 *
 * Instead we use two independent concurrency primitives, each suited to the
 * type of work it bounds:
 *
 *   - WorkerPool   (services/concurrency/WorkerPool.ts)
 *     Fixed pool of `worker_threads`, sized by WORKER_POOL_SIZE. CPU-bound
 *     tasks (1, 2, 3 above) run on real OS threads so they don't block the
 *     event loop that's simultaneously serving other HTTP requests.
 *
 *   - TaskQueue    (services/concurrency/TaskQueue.ts)
 *     Bounded-concurrency async queue with retry + backoff, sized by
 *     MAX_CONCURRENT_AI_CALLS. I/O-bound AI calls (4 above) go through this
 *     so we never exceed Gemini's effective rate limit, and a flaky network
 *     call gets retried instead of failing the whole analysis.
 *
 * Within ONE analysis request, steps 1 and 2 are independent of each other,
 * so they're dispatched to the worker pool together and awaited with
 * Promise.all — that's a legitimate use of it, because the worker pool (not
 * Promise.all) is what's actually enforcing the concurrency bound. Step 3
 * depends on the outputs of 1 and 2. Step 4 is independent of 3 and is fired
 * at the same time as 3, then joined.
 *
 * ANALYSIS-LEVEL throttling: a separate `analysisQueue` (MAX_CONCURRENT_ANALYSES)
 * bounds how many *entire* analyses run concurrently across all users, so the
 * worker pool and AI queue underneath never see more load than they're sized
 * for, even under traffic bursts.
 * ============================================================================
 */

const workerPool = new WorkerPool(env.WORKER_POOL_SIZE);
const aiQueue = new TaskQueue(env.MAX_CONCURRENT_AI_CALLS);
const analysisQueue = new TaskQueue(env.MAX_CONCURRENT_ANALYSES);

export interface PipelineResult {
  parsedResume: {
    skills: string[];
    experience: string[];
    education: string[];
    certifications: string[];
    projects: string[];
  };
  atsResult: {
    score: number;
    missingKeywords: string[];
    strengths: string[];
    weaknesses: string[];
    breakdown: Record<string, number>;
  };
  aiFeedback: AiFeedback;
  processingTimeMs: number;
}

export async function runAnalysisPipeline(resumeText: string, jobDescription: string): Promise<PipelineResult> {
  return analysisQueue.add(
    () => executePipeline(resumeText, jobDescription),
    { label: "full-analysis", retries: 1, priority: 0 }
  );
}

async function executePipeline(resumeText: string, jobDescription: string): Promise<PipelineResult> {
  const startedAt = Date.now();

  // Stage A: parse resume + JD concurrently on the worker pool, AND kick off
  // the AI call concurrently with both (it only needs raw text, not parsed output).
  const [parsedResume, parsedJd, aiFeedback] = await Promise.all([
    workerPool.run({ type: "parseResume", payload: resumeText }) as Promise<PipelineResult["parsedResume"]>,
    workerPool.run({ type: "parseJobDescription", payload: jobDescription }) as Promise<{
      skills: string[];
      keywords: string[];
    }>,
    aiQueue.add(() => generateAiFeedback(resumeText, jobDescription), {
      label: "gemini-feedback",
      retries: 2,
      retryDelayMs: env.QUEUE_RETRY_DELAY_MS,
    }),
  ]);

  // Stage B: ATS scoring depends on Stage A's outputs, dispatched to the worker pool.
  const atsResult = (await workerPool.run({
    type: "scoreAts",
    payload: {
      resumeSkills: parsedResume.skills,
      resumeText,
      jdSkills: parsedJd.skills,
      jdKeywords: parsedJd.keywords,
      hasProjects: parsedResume.projects.length > 0,
      hasEducation: parsedResume.education.length > 0,
    },
  })) as PipelineResult["atsResult"];

  return {
    parsedResume,
    atsResult,
    aiFeedback,
    processingTimeMs: Date.now() - startedAt,
  };
}

export function getPipelineStats() {
  return {
    workerPool: workerPool.stats,
    aiQueue: aiQueue.stats,
    analysisQueue: analysisQueue.stats,
  };
}
