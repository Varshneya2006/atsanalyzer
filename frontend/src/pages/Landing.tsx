import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";

const FEATURES = [
  { tag: "01", title: "ATS scoring", body: "A weighted score out of 100 built from skill match, keyword density, project relevance, education fit, and formatting — the same signals real ATS software checks for." },
  { tag: "02", title: "Concurrent pipeline", body: "Resume parsing, job-description parsing, scoring, and AI feedback run across a worker pool and rate-limited queue at the same time, not one after another." },
  { tag: "03", title: "Gap detection", body: "Missing keywords and skills are surfaced explicitly, line by line, so you know exactly what to add before you hit submit." },
  { tag: "04", title: "Downloadable reports", body: "Every analysis can be exported as a standalone report — useful for tracking how a resume improves across versions." },
];

const PLANS = [
  { name: "Scan", price: "Free", desc: "For a single pass before you apply.", perks: ["3 analyses / month", "1 resume slot", "Core ATS score"] },
  { name: "Calibrate", price: "$9/mo", desc: "For an active application season.", perks: ["Unlimited analyses", "5 resume slots", "AI feedback + interview tips", "Downloadable reports"] },
  { name: "Cluster", price: "$29/mo", desc: "For teams and bootcamps.", perks: ["Everything in Calibrate", "Shared dashboards", "Admin usage analytics", "Priority processing"] },
];

const TESTIMONIALS = [
  { quote: "Found three missing keywords I'd never have caught myself. Got an interview at the next company I applied to.", name: "R. Iyer", role: "New grad, SDE" },
  { quote: "The gap detection is blunt in a useful way. It doesn't soften the feedback, which is exactly what I needed.", name: "P. Sharma", role: "Career switcher" },
  { quote: "Watching the concurrent pipeline finish in under two seconds instead of waiting on four sequential calls is satisfying.", name: "M. Fernandes", role: "Backend engineer" },
];

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 font-mono text-sm text-phosphor">
              <span className="animate-blink">█</span> scanning resumes since 2026
            </p>
            <h1 className="font-sans text-5xl font-extrabold leading-[1.05] text-paper md:text-6xl">
              Your resume,
              <br />
              read like a <span className="text-phosphor">machine</span> reads it.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              Upload a resume, paste a job description, and get the same kind of pass/fail signal
              an ATS gives a recruiter — before you ever hit submit.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/register"
                className="rounded bg-phosphor px-6 py-3 font-mono font-semibold text-ink hover:shadow-glow transition-shadow"
              >
                run a free scan →
              </Link>
              <Link
                to="/login"
                className="rounded border border-line px-6 py-3 font-mono text-muted hover:border-phosphor hover:text-phosphor transition-colors"
              >
                sign in
              </Link>
            </div>
          </div>

          <GlassCard className="relative font-mono text-sm">
            <div className="mb-3 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-crimson" />
              <span className="h-3 w-3 rounded-full bg-amber" />
              <span className="h-3 w-3 rounded-full bg-phosphor" />
            </div>
            <pre className="overflow-x-auto text-muted">
{`$ scanline analyze --resume r.pdf --jd jd.txt

[worker-pool] parseResume      ... done (41ms)
[worker-pool] parseJobDesc     ... done (38ms)
[ai-queue]    geminiFeedback   ... done (612ms)
[worker-pool] scoreAts         ... done (12ms)

score: 87/100
missing: ["distributed systems", "graphql"]
strengths: 4   weaknesses: 2`}
            </pre>
          </GlassCard>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 font-sans text-3xl font-bold text-paper">What it actually checks</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f) => (
            <GlassCard key={f.tag}>
              <span className="font-mono text-xs text-phosphordim">{f.tag}</span>
              <h3 className="mt-2 text-xl font-semibold text-paper">{f.title}</h3>
              <p className="mt-2 text-muted">{f.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-line bg-panel/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 font-sans text-3xl font-bold text-paper">Pricing</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <GlassCard key={p.name} className="flex flex-col">
                <h3 className="font-mono text-lg text-phosphor">{p.name}</h3>
                <p className="mt-1 text-3xl font-bold text-paper">{p.price}</p>
                <p className="mt-1 text-sm text-muted">{p.desc}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex gap-2">
                      <span className="text-phosphor">✓</span> {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="mt-6 rounded border border-line py-2 text-center font-mono text-sm text-paper hover:border-phosphor hover:text-phosphor transition-colors"
                >
                  choose {p.name.toLowerCase()}
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 font-sans text-3xl font-bold text-paper">From the queue</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <GlassCard key={t.name}>
              <p className="text-muted">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 font-mono text-sm text-paper">{t.name}</p>
              <p className="font-mono text-xs text-phosphordim">{t.role}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="border-t border-line py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-sans text-3xl font-bold text-paper">Questions before you scan?</h2>
          <p className="mt-3 text-muted">Reach the team directly — we read every message.</p>
          <a
            href="mailto:support@scanline.dev"
            className="mt-6 inline-block rounded bg-phosphor px-6 py-3 font-mono font-semibold text-ink hover:shadow-glow transition-shadow"
          >
            support@scanline.dev
          </a>
        </div>
      </section>
    </div>
  );
}
