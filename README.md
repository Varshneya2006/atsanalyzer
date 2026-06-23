# Scanline — AI Resume Analyzer & ATS Scorer

A full-stack MERN application that scores a resume against a job description the way an ATS does,
with a genuinely concurrent backend processing pipeline: a `worker_threads` pool for CPU-bound parsing
and scoring, plus a separate bounded, retrying task queue for rate-limited Gemini AI calls.

## Why this project exists

Most resume-analyzer clones run their "AI pipeline" as a flat `Promise.all([...])` over four functions
and call it concurrency. That controls ordering, not resource usage — it doesn't stop a traffic spike
from firing 200 simultaneous Gemini calls or fighting over Node's single JS thread for CPU-bound parsing.

This project implements the concurrency primitives a real backend would need:

- **`Semaphore`** — counting semaphore for bounding concurrent async work
- **`TaskQueue`** — bounded-concurrency queue built on the semaphore, with retry + exponential backoff + priority ordering
- **`WorkerPool`** — a fixed pool of real Node `worker_threads`, so CPU-bound parsing/scoring runs on actual
  OS threads instead of blocking the event loop that's serving other requests

See `backend/src/services/analysisPipeline.ts` for the full architecture writeup and how these three
pieces compose for a single analysis request.

## Tech Stack

**Frontend**: React, Vite, TypeScript, Tailwind CSS, Redux Toolkit, React Router, Axios, Recharts
**Backend**: Node.js, Express, TypeScript
**Database**: MongoDB Atlas + Mongoose
**Auth**: JWT (access + refresh), bcrypt, httpOnly refresh cookie
**AI**: Google Gemini API
**File parsing**: pdf-parse, mammoth
**Deployment**: Render (backend), Vercel (frontend)

## Project Structure

```
ats-analyzer/
├── backend/
│   └── src/
│       ├── config/          # env loading, MongoDB connection
│       ├── controllers/      # HTTP handlers
│       ├── services/
│       │   ├── concurrency/  # Semaphore, TaskQueue, WorkerPool, worker.ts
│       │   ├── analysisPipeline.ts
│       │   ├── aiService.ts
│       │   ├── authService.ts
│       │   └── fileExtractionService.ts
│       ├── models/           # User, Token, Resume, Analysis, Report
│       ├── middlewares/       # auth, error, rate limit, upload, validation
│       ├── routes/
│       ├── validators/
│       └── utils/            # jwt helpers, apiError, seed script
├── frontend/
│   └── src/
│       ├── api/              # axios client with token refresh interceptor
│       ├── store/             # Redux Toolkit slices
│       ├── components/        # Navbar, Footer, ProtectedRoute, ScoreGauge, GlassCard
│       ├── pages/              # Landing, auth, Dashboard, NewAnalysis, AnalysisResult, Profile, AdminPanel
│       └── types/
├── postman_collection.json
├── DEPLOYMENT.md
└── README.md
```

## Features

- JWT auth with refresh-token rotation, forgot/reset password, protected routes, role-based admin access
- Resume upload (PDF/DOCX) → parsed into skills, experience, education, certifications, projects
- ATS scoring: weighted blend of skill match, keyword density, project relevance, education relevance, formatting
- AI feedback via Gemini: resume summary, missing skills, improvement suggestions, interview tips, job-match analysis
- Dashboard: total analyses, average/best score, resume count, score history chart, monthly analyses chart, missing-keyword breakdown
- Admin panel: list/delete users, view all reports, live concurrency pipeline load (worker pool / AI queue / analysis queue utilization)
- Downloadable per-analysis JSON report
- Security: Helmet, rate limiting (general/auth/analysis tiers), XSS sanitization, CORS, file-type/size validation on uploads

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env    # fill in MONGO_URI, JWT secrets, GEMINI_API_KEY
npm install
npm run dev              # http://localhost:5000

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173

# Optional: seed demo data
cd backend && npm run seed
```

See `DEPLOYMENT.md` for the full Render + Vercel + MongoDB Atlas deployment walkthrough,
and `postman_collection.json` for a ready-to-import API collection.

## Concurrency in numbers

A single analysis request dispatches:
1. Resume parsing → worker pool
2. Job-description parsing → worker pool (parallel with #1)
3. Gemini AI feedback → rate-limited AI queue (parallel with #1 and #2)
4. ATS scoring → worker pool (depends on #1 and #2's output)

All of it is wrapped in an outer `analysisQueue` that caps total concurrent analyses across all users,
so the worker pool and AI queue never see more load than they're sized for. `GET /api/analyses/stats/pipeline`
(and the admin panel) expose live queue depth and worker utilization.
