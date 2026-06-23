import { ReactElement, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProfile } from "../store/slices/authSlice";
import { getAccessToken } from "../api/axiosClient";

interface Props {
  children: ReactElement;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const { user, status } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user && getAccessToken()) {
      dispatch(fetchProfile()).finally(() => setChecked(true));
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked && status !== "succeeded") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-mono text-phosphor">
        <span className="animate-pulse">loading session…</span>
      </div>
    );
  }

  if (!user && !getAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
