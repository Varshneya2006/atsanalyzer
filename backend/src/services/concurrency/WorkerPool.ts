import { Worker } from "worker_threads";
import path from "path";
import { randomUUID } from "crypto";

export interface WorkerJobRequest {
  type: "parseResume" | "parseJobDescription" | "scoreAts";
  payload: unknown;
}

interface PendingJob {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

/**
 * WorkerPool — fixed-size pool of Node worker_threads.
 *
 * Why worker_threads (not just async/await):
 * Node's event loop is single-threaded for JS execution. Parsing a 5-page PDF,
 * tokenizing a job description, and computing TF-IDF-style keyword overlap are
 * all CPU-bound — they block the event loop while running. Running them with
 * plain async functions means they queue up behind each other on the same
 * thread no matter how many "concurrent" promises you create.
 *
 * worker_threads gives genuine parallelism across CPU cores. This pool keeps
 * WORKER_POOL_SIZE threads alive and round-robins/queues jobs onto them,
 * rather than spawning a new thread per request (which is expensive).
 */
export class WorkerPool {
  private readonly workers: Worker[] = [];
  private readonly idle: Worker[] = [];
  private readonly waitQueue: Array<{ job: WorkerJobRequest; pending: PendingJob }> = [];
  private readonly inFlight = new Map<Worker, Map<string, PendingJob>>();

  private readonly isDev = process.env.NODE_ENV !== "production";

  constructor(
    private readonly size: number,
    // In prod, tsc compiles worker.ts -> dist/.../worker.js, run directly.
    // In dev (ts-node), we run the .ts source via ts-node/register inside the thread.
    private readonly workerScript = path.join(
      __dirname,
      process.env.NODE_ENV === "production" ? "worker.js" : "worker.ts"
    )
  ) {
    for (let i = 0; i < size; i++) {
      const worker = this.spawnWorker();
      this.workers.push(worker);
      this.idle.push(worker);
    }
  }

  private spawnWorker(): Worker {
    const worker = new Worker(this.workerScript, this.isDev ? { execArgv: ["--require", "ts-node/register"] } : {});
    this.inFlight.set(worker, new Map());

    worker.on("message", (msg: { id: string; result?: unknown; error?: string }) => {
      const jobs = this.inFlight.get(worker);
      const pending = jobs?.get(msg.id);
      if (!pending) return;
      jobs!.delete(msg.id);

      if (msg.error) pending.reject(new Error(msg.error));
      else pending.resolve(msg.result);

      this.idle.push(worker);
      this.dispatchNext();
    });

    worker.on("error", (err) => {
      console.error("[worker-pool] worker thread error:", err);
      // Reject anything in flight on this worker so callers don't hang forever
      const jobs = this.inFlight.get(worker);
      jobs?.forEach((pending) => pending.reject(err));
      jobs?.clear();
    });

    return worker;
  }

  run(job: WorkerJobRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.waitQueue.push({ job, pending: { resolve, reject } });
      this.dispatchNext();
    });
  }

  private dispatchNext(): void {
    if (this.waitQueue.length === 0 || this.idle.length === 0) return;

    const worker = this.idle.shift()!;
    const { job, pending } = this.waitQueue.shift()!;
    const id = randomUUID();

    this.inFlight.get(worker)!.set(id, pending);
    worker.postMessage({ id, ...job });
  }

  get stats() {
    return {
      poolSize: this.size,
      idle: this.idle.length,
      busy: this.size - this.idle.length,
      queued: this.waitQueue.length,
    };
  }

  async terminate(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.terminate()));
  }
}
