export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Resume {
  id: string;
  fileName: string;
  fileType: "pdf" | "docx";
  createdAt?: string;
}

export interface SectionFeedback {
  skills: string;
  experience: string;
  education: string;
  projects: string;
  formatting: string;
}

export interface AiFeedback {
  summary: string;
  missingSkills: string[];
  improvementSuggestions: string[];
  interviewTips: string[];
  jobMatchAnalysis: string;
}

export interface Analysis {
  _id: string;
  resume: string;
  jobDescription: string;
  status: "queued" | "processing" | "completed" | "failed";
  score: number;
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  sectionFeedback: SectionFeedback;
  aiFeedback: AiFeedback;
  processingTimeMs: number;
  createdAt: string;
}

export interface DashboardSummary {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  resumeUploadCount: number;
  scoreHistory: { date: string; score: number }[];
  monthlyAnalyses: { month: string; count: number }[];
}

export interface SkillBreakdownItem {
  keyword: string;
  count: number;
}
