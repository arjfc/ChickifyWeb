// client/src/context/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div style={{ padding: 24 }}>Checking session…</div>;
  if (!user) return <Navigate to="/signin" replace state={{ from: loc }} />;
  return children;
}
