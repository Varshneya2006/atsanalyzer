import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/axiosClient";
import GlassCard from "../components/GlassCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      setDevToken(res.data.devResetToken || null);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
      <GlassCard className="w-full">
        <h1 className="font-mono text-2xl font-bold text-paper">reset password</h1>
        <p className="mt-1 text-sm text-muted">enter the email tied to your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-phosphor py-2.5 font-mono font-semibold text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
          >
            {loading ? "sending…" : "send reset link"}
          </button>
        </form>

        {message && <p className="mt-4 font-mono text-sm text-muted">{message}</p>}
        {devToken && (
          <p className="mt-2 font-mono text-xs text-amber">
            dev mode token: <Link to={`/reset-password?token=${devToken}`} className="underline">{devToken}</Link>
          </p>
        )}
      </GlassCard>
    </div>
  );
}
