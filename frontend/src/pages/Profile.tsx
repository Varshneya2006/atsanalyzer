import { FormEvent, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { apiClient } from "../api/axiosClient";
import GlassCard from "../components/GlassCard";

export default function Profile() {
  const { user } = useAppSelector((s) => s.auth);
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch("/auth/profile", { name });
      setMessage("Profile updated.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="font-sans text-3xl font-bold text-paper">Profile</h1>

      <GlassCard className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">email</label>
            <input
              disabled
              value={user?.email || ""}
              className="mt-1 w-full rounded border border-line bg-ink/50 px-3 py-2 text-muted"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">role</label>
            <input
              disabled
              value={user?.role || ""}
              className="mt-1 w-full rounded border border-line bg-ink/50 px-3 py-2 text-muted"
            />
          </div>

          {message && <p className="font-mono text-sm text-phosphor">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-phosphor py-2.5 font-mono font-semibold text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
          >
            {saving ? "saving…" : "save changes"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
