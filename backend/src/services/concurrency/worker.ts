import { parentPort } from "worker_threads";

interface WorkerMessage {
  id: string;
  type: "parseResume" | "parseJobDescription" | "scoreAts";
  payload: unknown;
}

const SKILL_BANK = [
  "javascript", "typescript", "python", "java", "c++", "c", "go", "rust",
  "react", "redux", "node.js", "express", "mongodb", "postgresql", "mysql",
  "docker", "kubernetes", "aws", "gcp", "azure", "graphql", "rest api",
  "git", "ci/cd", "microservices", "system design", "data structures",
  "algorithms", "machine learning", "deep learning", "tensorflow", "pytorch",
  "concurrency", "multithreading", "distributed systems", "load balancing",
  "caching", "redis", "kafka", "rabbitmq", "websockets", "tailwind css",
  "next.js", "vue", "angular", "html", "css", "sql", "nosql", "linux",
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_BANK.filter((skill) => {
    const pattern = new RegExp(`(?<![a-z0-9])${escapeRegex(skill)}(?![a-z0-9])`, "i");
    return pattern.test(lower);
  });
}

function extractSection(text: string, headers: string[]): string[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const results: string[] = [];
  let capturing = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (headers.some((h) => lower === h || lower.startsWith(h))) {
      capturing = true;
      continue;
    }
    if (capturing && /^[A-Z][A-Z\s]{3,}$/.test(line)) {
      capturing = false; // hit next ALL-CAPS section header
    }
    if (capturing && line.length > 2) results.push(line);
  }
  return results;
}

function parseResume(rawText: string) {
  return {
    skills: extractSkills(rawText),
    experience: extractSection(rawText, ["experience", "work experience"]),
    education: extractSection(rawText, ["education"]),
    certifications: extractSection(rawText, ["certifications", "certificates"]),
    projects: extractSection(rawText, ["projects"]),
  };
}

function parseJobDescription(rawText: string) {
  const skills = extractSkills(rawText);
  const words = rawText
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);

  return { skills, keywords };
}

function scoreAts(payload: {
  resumeSkills: string[];
  resumeText: string;
  jdSkills: string[];
  jdKeywords: string[];
  hasProjects: boolean;
  hasEducation: boolean;
}) {
  const { resumeSkills, resumeText, jdSkills, jdKeywords, hasProjects, hasEducation } = payload;

  const resumeSkillSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const jdSkillSet = new Set(jdSkills.map((s) => s.toLowerCase()));

  const matchedSkills = [...jdSkillSet].filter((s) => resumeSkillSet.has(s));
  const missingKeywords = [...jdSkillSet].filter((s) => !resumeSkillSet.has(s));

  const skillMatchScore = jdSkillSet.size > 0 ? (matchedSkills.length / jdSkillSet.size) * 100 : 50;

  const lowerResume = resumeText.toLowerCase();
  const keywordHits = jdKeywords.filter((k) => lowerResume.includes(k));
  const keywordDensityScore = jdKeywords.length > 0 ? (keywordHits.length / jdKeywords.length) * 100 : 50;

  const projectRelevanceScore = hasProjects ? 85 : 40;
  const educationRelevanceScore = hasEducation ? 80 : 50;
  const formattingScore = resumeText.length > 500 && resumeText.length < 15000 ? 90 : 65;

  const weighted =
    skillMatchScore * 0.4 +
    keywordDensityScore * 0.25 +
    projectRelevanceScore * 0.15 +
    educationRelevanceScore * 0.1 +
    formattingScore * 0.1;

  const score = Math.round(Math.min(100, Math.max(0, weighted)));

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (matchedSkills.length > 0) strengths.push(`Strong match on: ${matchedSkills.slice(0, 5).join(", ")}`);
  if (hasProjects) strengths.push("Relevant project experience listed");
  if (formattingScore >= 90) strengths.push("Well-structured resume length and formatting");

  if (missingKeywords.length > 0) weaknesses.push(`Missing keywords: ${missingKeywords.slice(0, 5).join(", ")}`);
  if (!hasProjects) weaknesses.push("No clearly identifiable projects section");
  if (keywordDensityScore < 50) weaknesses.push("Low keyword density relative to job description");

  return {
    score,
    missingKeywords: missingKeywords.slice(0, 15),
    strengths,
    weaknesses,
    breakdown: {
      skillMatchScore: Math.round(skillMatchScore),
      keywordDensityScore: Math.round(keywordDensityScore),
      projectRelevanceScore,
      educationRelevanceScore,
      formattingScore,
    },
  };
}

parentPort?.on("message", (msg: WorkerMessage) => {
  try {
    let result: unknown;
    switch (msg.type) {
      case "parseResume":
        result = parseResume(msg.payload as string);
        break;
      case "parseJobDescription":
        result = parseJobDescription(msg.payload as string);
        break;
      case "scoreAts":
        result = scoreAts(
          msg.payload as Parameters<typeof scoreAts>[0]
        );
        break;
      default:
        throw new Error(`Unknown job type: ${msg.type}`);
    }
    parentPort?.postMessage({ id: msg.id, result });
  } catch (err) {
    parentPort?.postMessage({ id: msg.id, error: (err as Error).message });
  }
});
