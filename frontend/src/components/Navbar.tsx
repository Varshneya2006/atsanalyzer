import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";

export default function Navbar() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-mono text-lg font-bold text-paper">
          <span className="text-phosphor">&gt;_</span> scanline
        </Link>

        <div className="flex items-center gap-6 font-mono text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="text-muted hover:text-phosphor transition-colors">dashboard</Link>
              <Link to="/analyze" className="text-muted hover:text-phosphor transition-colors">analyze</Link>
              <Link to="/profile" className="text-muted hover:text-phosphor transition-colors">profile</Link>
              {user.role === "admin" && (
                <Link to="/admin" className="text-amber hover:text-phosphor transition-colors">admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded border border-line px-3 py-1.5 text-muted hover:border-phosphor hover:text-phosphor transition-colors focus-ring"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-muted hover:text-phosphor transition-colors">login</Link>
              <Link
                to="/register"
                className="rounded bg-phosphor px-4 py-1.5 font-semibold text-ink hover:shadow-glow transition-shadow"
              >
                get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
