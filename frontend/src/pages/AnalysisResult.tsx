import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAnalysisById } from "../store/slices/analysisSlice";
import GlassCard from "../components/GlassCard";
import ScoreGauge from "../components/ScoreGauge";
import { apiClient } from "../api/axiosClient";

export default function AnalysisResult() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { current: analysis } = useAppSelector((s) => s.analysis);

  useEffect(() => {
    if (id) dispatch(fetchAnalysisById(id));
  }, [id, dispatch]);

  const handleDownload = async () => {
    if (!analysis) return;
    const res = await apiClient.post(`/reports/${analysis._id}`, {}, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ats-report-${analysis._id}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!analysis) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-phosphor">
        <span className="animate-pulse">loading analysis…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-paper">Analysis Result</h1>
          <p className="mt-1 font-mono text-sm text-muted">
            processed in {analysis.processingTimeMs}ms via concurrent pipeline
          </p>
        </div>
        <ScoreGauge score={analysis.score} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <GlassCard>
          <h2 className="font-mono text-sm uppercase tracking-wide text-phosphor">strengths</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-phosphor">+</span> {s}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="font-mono text-sm uppercase tracking-wide text-crimson">weaknesses</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-crimson">-</span> {w}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h2 className="font-mono text-sm uppercase tracking-wide text-amber">missing keywords</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.missingKeywords.map((k) => (
              <span key={k} className="rounded border border-amber/30 px-2 py-1 font-mono text-xs text-amber">
                {k}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h2 className="font-mono text-sm uppercase tracking-wide text-muted">section feedback</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(analysis.sectionFeedback).map(([key, value]) => (
              <div key={key} className="flex gap-3">
                <dt className="w-28 shrink-0 font-mono text-muted">{key}</dt>
                <dd className="text-paper">{value}</dd>
              </div>
            ))}
          </dl>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h2 className="font-mono text-sm uppercase tracking-wide text-phosphor">AI feedback</h2>
          <p className="mt-3 text-sm text-paper">{analysis.aiFeedback.summary}</p>

          <h3 className="mt-4 font-mono text-xs uppercase text-muted">job match</h3>
          <p className="mt-1 text-sm text-muted">{analysis.aiFeedback.jobMatchAnalysis}</p>

          <h3 className="mt-4 font-mono text-xs uppercase text-muted">improvement suggestions</h3>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            {analysis.aiFeedback.improvementSuggestions.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>

          <h3 className="mt-4 font-mono text-xs uppercase text-muted">interview prep tips</h3>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            {analysis.aiFeedback.interviewTips.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <button
        onClick={handleDownload}
        className="mt-8 w-full rounded border border-line py-3 font-mono text-sm text-paper hover:border-phosphor hover:text-phosphor transition-colors"
      >
        ↓ download full report (.json)
      </button>
    </div>
  );
}
