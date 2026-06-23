/**
 * Seed script — creates a demo admin, demo user, a sample resume, and a sample
 * completed analysis so the dashboard/admin panel have data to render immediately.
 *
 * Run with: npx ts-node src/utils/seed.ts
 */
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Resume } from "../models/Resume";
import { Analysis } from "../models/Analysis";

const SAMPLE_RESUME_TEXT = `VARSHNEYA
B.Tech CSE, NIT Patna | varshneya2006@example.com | github.com/Varshneya2006

EDUCATION
B.Tech in Computer Science and Engineering, NIT Patna, CGPA 9.36

PROJECTS
Scanline — AI Resume Analyzer and ATS Scorer. Built with Express, TypeScript, MongoDB, React, Redux Toolkit.
Implemented a concurrent processing pipeline using worker threads, a bounded task queue, and a semaphore
primitive to run resume parsing, job description parsing, ATS scoring, and AI feedback generation in parallel.

ShopWave — full-stack e-commerce platform with Stripe Checkout, Cloudinary, JWT auth with refresh rotation.

SKILLS
javascript, typescript, react, redux, node.js, express, mongodb, docker, git, system design, concurrency,
distributed systems, rest api, sql

CERTIFICATIONS
Generative AI Certification
NPTEL Top 2%`;

const SAMPLE_JD = `We are looking for a Software Engineer Intern with strong fundamentals in data structures,
algorithms, and system design. Experience with distributed systems, concurrency, REST APIs,
and cloud platforms (AWS or GCP) is a plus. You should be comfortable with TypeScript, React,
Node.js, Docker, and Kubernetes. Familiarity with GraphQL and caching (Redis) is a bonus.`;

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Resume.deleteMany({}), Analysis.deleteMany({})]);

  const admin = await User.create({
    name: "Admin",
    email: "admin@atsanalyzer.com",
    password: "AdminPass123",
    role: "admin",
  });

  const demoUser = await User.create({
    name: "Varshneya",
    email: "demo@atsanalyzer.com",
    password: "DemoPass123",
    role: "user",
    resumeUploadCount: 1,
  });

  const resume = await Resume.create({
    user: demoUser._id,
    originalFileName: "varshneya_resume.pdf",
    fileType: "pdf",
    rawText: SAMPLE_RESUME_TEXT,
    parsed: {
      skills: ["javascript", "typescript", "react", "redux", "node.js", "express", "mongodb", "docker"],
      experience: [],
      education: ["B.Tech in Computer Science and Engineering, NIT Patna, CGPA 9.36"],
      certifications: ["Generative AI Certification", "NPTEL Top 2%"],
      projects: ["Scanline — AI Resume Analyzer and ATS Scorer", "ShopWave — full-stack e-commerce platform"],
    },
  });

  await Analysis.create({
    user: demoUser._id,
    resume: resume._id,
    jobDescription: SAMPLE_JD,
    status: "completed",
    score: 78,
    missingKeywords: ["kubernetes", "graphql", "redis", "aws"],
    strengths: ["Strong match on: typescript, react, node.js, docker", "Relevant project experience listed"],
    weaknesses: ["Missing keywords: kubernetes, graphql, redis, aws"],
    sectionFeedback: {
      skills: "8 skills detected",
      experience: "0 experience lines detected",
      education: "Education section found",
      projects: "Projects section found",
      formatting: "Breakdown: skillMatch 67, keywordDensity 71, projects 85, education 80, formatting 90",
    },
    aiFeedback: {
      summary: "Strong systems-oriented resume with clear concurrency project experience.",
      missingSkills: ["kubernetes", "graphql", "redis", "aws"],
      improvementSuggestions: [
        "Add a line quantifying the performance improvement from the concurrent pipeline (e.g. latency reduction %).",
        "Mention any exposure to Kubernetes or container orchestration, even at a learning/project level.",
      ],
      interviewTips: [
        "Be ready to explain why worker_threads were chosen over plain async/await for CPU-bound parsing.",
        "Practice explaining the tradeoffs between a bounded queue and unbounded Promise.all.",
      ],
      jobMatchAnalysis: "Good fit for the systems/backend aspects of the role; cloud platform exposure is the main gap.",
    },
    processingTimeMs: 842,
  });

  console.log("Seed complete:");
  console.log(`  admin login: admin@atsanalyzer.com / AdminPass123`);
  console.log(`  demo login:  demo@atsanalyzer.com / DemoPass123`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
