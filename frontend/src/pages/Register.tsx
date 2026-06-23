import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser } from "../store/slices/authSlice";
import GlassCard from "../components/GlassCard";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) navigate("/dashboard");
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-6">
      <GlassCard className="w-full">
        <h1 className="font-mono text-2xl font-bold text-paper">create account</h1>
        <p className="mt-1 text-sm text-muted">three analyses free, no card required.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-muted">password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-ink px-3 py-2 text-paper focus-ring"
              placeholder="8+ characters, 1 number"
            />
          </div>

          {error && <p className="font-mono text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded bg-phosphor py-2.5 font-mono font-semibold text-ink hover:shadow-glow transition-shadow disabled:opacity-50"
          >
            {status === "loading" ? "creating…" : "create account"}
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-muted">
          already have an account?{" "}
          <Link to="/login" className="text-phosphor hover:underline">sign in</Link>
        </p>
      </GlassCard>
    </div>
  );
}
