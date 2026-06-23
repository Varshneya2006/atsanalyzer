# Deployment Guide

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Database Access → add a user with a strong password.
3. Network Access → add `0.0.0.0/0` (or Render's IP range) so Render can connect.
4. Get the connection string from "Connect" → "Drivers" and substitute your username/password.
   It looks like: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ats-analyzer?retryWrites=true&w=majority`

## 2. Backend → Render

1. Push the `backend/` folder to a GitHub repo (or the monorepo root, with Render's root directory set to `backend`).
2. On https://render.com → New → Web Service → connect the repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add environment variables (Render dashboard → Environment) matching `.env.example`:
   - `NODE_ENV=production`
   - `MONGO_URI=<your Atlas connection string>`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (generate with `openssl rand -hex 32`)
   - `GEMINI_API_KEY` (from https://aistudio.google.com/apikey)
   - `CLIENT_URL=<your deployed Vercel URL>`
   - `WORKER_POOL_SIZE`, `MAX_CONCURRENT_ANALYSES`, `MAX_CONCURRENT_AI_CALLS` (defaults are fine to start)
5. Deploy. Render gives you a URL like `https://ats-analyzer-backend.onrender.com`.
6. Confirm it's alive: `GET https://ats-analyzer-backend.onrender.com/health`

> Note: Render's free tier spins down on inactivity — the first request after idling will be slow (cold start).

## 3. Frontend → Vercel

1. Push `frontend/` to GitHub (same repo, different root directory is fine).
2. On https://vercel.com → New Project → import the repo.
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment variable:
   - `VITE_API_BASE_URL=https://ats-analyzer-backend.onrender.com/api`
5. Deploy. Vercel gives you a URL like `https://scanline.vercel.app`.
6. Go back to Render and update `CLIENT_URL` to this Vercel URL, then redeploy the backend (needed for CORS + cookie settings to match).

## 4. Seed demo data (optional)

Once the backend is deployed and `MONGO_URI` is set, run the seed script locally against the production database to populate a demo admin/user:

```bash
cd backend
MONGO_URI="<your atlas uri>" npm run seed
```

This creates:
- `admin@atsanalyzer.com` / `AdminPass123` (admin role)
- `demo@atsanalyzer.com` / `DemoPass123` (user role, with a sample resume + completed analysis)

**Change these passwords or delete these accounts before sharing the deployed URL publicly.**

## 5. Local development

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT secrets, GEMINI_API_KEY
npm install
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## 6. Troubleshooting

| Symptom | Likely cause |
|---|---|
| CORS error in browser console | `CLIENT_URL` on the backend doesn't match the frontend's actual origin |
| 401 on every request after login | Cookies blocked — confirm `withCredentials: true` (already set) and that frontend/backend are both HTTPS in production |
| Gemini calls always return fallback text | `GEMINI_API_KEY` missing or invalid; check Render logs for `[ai] Gemini call failed` |
| Worker pool tasks hang | Confirm `ts-node` is in `dependencies` (not just `devDependencies`) if running dev mode in a constrained environment |
