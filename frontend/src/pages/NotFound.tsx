import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-phosphor">404</p>
      <h1 className="mt-2 font-sans text-3xl font-bold text-paper">Nothing scanned here.</h1>
      <p className="mt-2 text-muted">This route doesn't exist.</p>
      <Link to="/" className="mt-6 rounded bg-phosphor px-5 py-2 font-mono font-semibold text-ink hover:shadow-glow">
        back to safety
      </Link>
    </div>
  );
}
