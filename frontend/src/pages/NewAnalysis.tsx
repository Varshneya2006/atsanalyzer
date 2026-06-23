import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { uploadResume, fetchResumes } from "../store/slices/resumeSlice";
import { createAnalysis } from "../store/slices/analysisSlice";
import GlassCard from "../components/GlassCard";

export default function NewAnalysis() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: resumes, uploading } = useAppSelector((s) => s.resume);
  const { loading: analyzing, error } = useAppSelector((s) => s.analysis);

  const [file, setFile] = useState<File | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  const handleUpload = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await dispatch(uploadResume(file));
    if (uploadResume.fulfilled.match(result)) {
      setSelectedResumeId(result.payload.id);
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous local error errors
    setLocalError(null);

    // Explicit UX Check: Alert user if they forgot to pick or upload a resume
    if (!selectedResumeId) {
      setLocalError("Please select an existing resume or upload a new one before running the analysis.");
      return;
    }

    const result = await dispatch(createAnalysis({ resumeId: selectedResumeId, jobDescription }));
    if (createAnalysis.fulfilled.match(result)) {
      navigate(`/analysis/${result.payload._id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-sans text-3xl font-bold text-paper">New Analysis</h1>
      <p className="mt-1 text-muted">Resume parsing, JD parsing, scoring, and AI feedback run concurrently.</p>

      <GlassCard className="mt-8">
        <h2 className="font-mono text-sm uppercase tracking-wide text-muted">1. choose a resume</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {resumes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelectedResumeId(r.id);
                setLocalError(null);
              }}
              className={`rounded border px-3 py-1.5 font-mono text-sm transition-colors ${
                selectedResumeId === r.id
                  ? "border-phosphor text-phosphor"
                  : "border-line text-muted hover:border-phosphor hover:text-phosphor"
              }`}
            >
              {r.fileName}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="font-mono text-sm text-muted"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="rounded border border-line px-4 py-1.5 font-mono text-sm text-paper hover:border-phosphor hover:text-phosphor disabled:opacity-50"
          >
            {uploading ? "uploading…" : "upload"}
          </button>
        </div>
      </GlassCard>

      <form onSubmit={handleSubmit}>
        <GlassCard className="mt-6">
          <h2 className="font-mono text-sm uppercase tracking-wide text-muted">2. paste job description</h2>
          <textarea
            required
            minLength={50}
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here (min. 50 characters)…"
            className="mt-3 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
          />
        </GlassCard>

        {/* Displays either the backend server errors or our missing resume validation check */}
        {(error || localError) && (
          <p className="mt-4 font-mono text-sm text-crimson">{error || localError}</p>
        )}

        <button
          type="submit"
          disabled={analyzing}
          className="mt-6 w-full rounded bg-phosphor py-3 font-mono font-semibold text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
        >
          {analyzing ? "running concurrent pipeline…" : "run analysis"}
        </button>
      </form>
    </div>
  );
}