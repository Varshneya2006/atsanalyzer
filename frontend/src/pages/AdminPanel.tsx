import { useEffect, useState } from "react";
import { apiClient } from "../api/axiosClient";
import GlassCard from "../components/GlassCard";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  resumeUploadCount: number;
  createdAt: string;
}

interface Stats {
  userCount: number;
  analysisCount: number;
  resumeCount: number;
  averageScore: number;
  pipeline: {
    workerPool: { poolSize: number; idle: number; busy: number; queued: number };
    aiQueue: { pending: number; active: number; concurrencyLimit: number };
    analysisQueue: { pending: number; active: number; concurrencyLimit: number };
  };
}

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const load = () => {
    apiClient.get("/admin/users").then((r) => setUsers(r.data.users));
    apiClient.get("/admin/stats").then((r) => setStats(r.data.stats));
  };

  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    await apiClient.delete(`/admin/users/${id}`);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-sans text-3xl font-bold text-paper">Admin Panel</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats && (
          <>
            <GlassCard><p className="font-mono text-xs text-muted">users</p><p className="mt-2 font-mono text-2xl text-phosphor">{stats.userCount}</p></GlassCard>
            <GlassCard><p className="font-mono text-xs text-muted">analyses</p><p className="mt-2 font-mono text-2xl text-phosphor">{stats.analysisCount}</p></GlassCard>
            <GlassCard><p className="font-mono text-xs text-muted">resumes</p><p className="mt-2 font-mono text-2xl text-phosphor">{stats.resumeCount}</p></GlassCard>
            <GlassCard><p className="font-mono text-xs text-muted">avg score</p><p className="mt-2 font-mono text-2xl text-phosphor">{stats.averageScore}</p></GlassCard>
          </>
        )}
      </div>

      {stats && (
        <GlassCard className="mt-6">
          <h2 className="font-mono text-sm uppercase tracking-wide text-muted">live pipeline load</h2>
          <div className="mt-3 grid gap-4 font-mono text-xs sm:grid-cols-3">
            <div>
              <p className="text-phosphor">worker pool</p>
              <p className="text-muted">busy {stats.pipeline.workerPool.busy}/{stats.pipeline.workerPool.poolSize} · queued {stats.pipeline.workerPool.queued}</p>
            </div>
            <div>
              <p className="text-phosphor">ai queue</p>
              <p className="text-muted">active {stats.pipeline.aiQueue.active}/{stats.pipeline.aiQueue.concurrencyLimit} · pending {stats.pipeline.aiQueue.pending}</p>
            </div>
            <div>
              <p className="text-phosphor">analysis queue</p>
              <p className="text-muted">active {stats.pipeline.analysisQueue.active}/{stats.pipeline.analysisQueue.concurrencyLimit} · pending {stats.pipeline.analysisQueue.pending}</p>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="mt-6 overflow-x-auto">
        <h2 className="font-mono text-sm uppercase tracking-wide text-muted">users</h2>
        <table className="mt-3 w-full text-left font-mono text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 pr-4">name</th>
              <th className="py-2 pr-4">email</th>
              <th className="py-2 pr-4">role</th>
              <th className="py-2 pr-4">uploads</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-line/50 text-paper">
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4 text-muted">{u.email}</td>
                <td className="py-2 pr-4">
                  <span className={u.role === "admin" ? "text-amber" : "text-muted"}>{u.role}</span>
                </td>
                <td className="py-2 pr-4">{u.resumeUploadCount}</td>
                <td className="py-2 pr-4">
                  {u.role !== "admin" && (
                    <button onClick={() => handleDelete(u._id)} className="text-crimson hover:underline">
                      delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
