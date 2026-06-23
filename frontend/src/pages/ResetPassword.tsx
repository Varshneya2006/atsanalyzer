import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/axiosClient";
import GlassCard from "../components/GlassCard";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword });
      navigate("/login");
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
      <GlassCard className="w-full">
        <h1 className="font-mono text-2xl font-bold text-paper">set new password</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">reset token</label>
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">new password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
            />
          </div>

          {error && <p className="font-mono text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-phosphor py-2.5 font-mono font-semibold text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
          >
            {loading ? "resetting…" : "reset password"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
