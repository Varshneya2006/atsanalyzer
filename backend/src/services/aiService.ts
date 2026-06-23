import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface AiFeedback {
  summary: string;
  missingSkills: string[];
  improvementSuggestions: string[];
  interviewTips: string[];
  jobMatchAnalysis: string;
}

const FALLBACK: AiFeedback = {
  summary: "AI feedback temporarily unavailable. Showing rule-based analysis only.",
  missingSkills: [],
  improvementSuggestions: ["Re-run analysis once AI service is available for tailored suggestions."],
  interviewTips: [],
  jobMatchAnalysis: "Unavailable",
};

export async function generateAiFeedback(resumeText: string, jobDescription: string): Promise<AiFeedback> {
  if (!env.GEMINI_API_KEY) {
    console.warn("[ai] GEMINI_API_KEY not set, returning fallback feedback");
    return FALLBACK;
  }

  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

  const prompt = `You are an expert technical recruiter and resume coach. Analyze the resume against the job description below and respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "summary": "2-3 sentence resume summary",
  "missingSkills": ["skill1", "skill2"],
  "improvementSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "interviewTips": ["tip1", "tip2", "tip3"],
  "jobMatchAnalysis": "2-3 sentence analysis of fit for this specific role"
}

RESUME:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*|```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as AiFeedback;

    return {
      summary: parsed.summary || FALLBACK.summary,
      missingSkills: parsed.missingSkills || [],
      improvementSuggestions: parsed.improvementSuggestions || [],
      interviewTips: parsed.interviewTips || [],
      jobMatchAnalysis: parsed.jobMatchAnalysis || FALLBACK.jobMatchAnalysis,
    };
  } catch (err) {
    console.error("[ai] Gemini call failed, using fallback:", err);
    return FALLBACK;
  }
}
