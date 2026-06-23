/**
 * Semaphore — classic counting semaphore for bounding concurrent async work.
 *
 * Why this exists instead of just `Promise.all`:
 * `Promise.all` fires every promise immediately — it does NOT limit concurrency,
 * it only waits for all of them. If you call Promise.all on 50 Gemini API requests,
 * you fire 50 requests at once and get rate-limited / OOM on large files.
 *
 * This Semaphore lets us say "run these N tasks, but never more than K at a time,"
 * which is the actual primitive production systems use (DB connection pools,
 * HTTP client pools, GPU/CPU worker pools all reduce to this).
 */
export class Semaphore {
  private permits: number;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number) {
    this.permits = maxConcurrent;
  }

  async acquire(): Promise<() => void> {
    if (this.permits > 0) {
      this.permits -= 1;
      return this.release.bind(this);
    }

    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        this.permits -= 1;
        resolve(this.release.bind(this));
      });
    });
  }

  private release(): void {
    this.permits += 1;
    const next = this.queue.shift();
    if (next) next();
  }

  get activeCount(): number {
    return this.maxConcurrent - this.permits;
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  /** Run a single async task under the semaphore's concurrency limit. */
  async run<T>(task: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      return await task();
    } finally {
      release();
    }
  }
}
