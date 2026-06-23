import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "../api/axiosClient";
import GlassCard from "../components/GlassCard";
import { DashboardSummary, SkillBreakdownItem } from "../types";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [breakdown, setBreakdown] = useState<SkillBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiClient.get("/dashboard/summary"), apiClient.get("/dashboard/skill-breakdown")])
      .then(([s, b]) => {
        setSummary(s.data.summary);
        setBreakdown(b.data.breakdown);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-phosphor">
        <span className="animate-pulse">loading dashboard…</span>
      </div>
    );
  }

  const cards = [
    { label: "total analyses", value: summary?.totalAnalyses ?? 0 },
    { label: "average score", value: `${summary?.averageScore ?? 0}` },
    { label: "best score", value: `${summary?.bestScore ?? 0}` },
    { label: "resumes uploaded", value: summary?.resumeUploadCount ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-sans text-3xl font-bold text-paper">Dashboard</h1>
        <Link
          to="/analyze"
          className="rounded bg-phosphor px-5 py-2 font-mono text-sm font-semibold text-ink hover:shadow-glow transition-shadow"
        >
          + new analysis
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <GlassCard key={c.label}>
            <p className="font-mono text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-phosphor">{c.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wide text-muted">score history</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={summary?.scoreHistory || []}>
              <CartesianGrid stroke="#1f2b25" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#90a299" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#101512", border: "1px solid #1f2b25", color: "#e8efe9" }} />
              <Line type="monotone" dataKey="score" stroke="#5cf2a8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wide text-muted">monthly analyses</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary?.monthlyAnalyses || []}>
              <CartesianGrid stroke="#1f2b25" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#90a299" fontSize={11} />
              <YAxis stroke="#90a299" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#101512", border: "1px solid #1f2b25", color: "#e8efe9" }} />
              <Bar dataKey="count" fill="#5cf2a8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wide text-muted">
            most frequently missing keywords
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={breakdown} layout="vertical">
              <CartesianGrid stroke="#1f2b25" strokeDasharray="3 3" />
              <XAxis type="number" stroke="#90a299" allowDecimals={false} />
              <YAxis type="category" dataKey="keyword" stroke="#90a299" width={120} fontSize={12} />
              <Tooltip contentStyle={{ background: "#101512", border: "1px solid #1f2b25", color: "#e8efe9" }} />
              <Bar dataKey="count" fill="#ffb454" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
