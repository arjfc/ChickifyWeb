// src/context/RequireRole.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireRole({ allow }) {
  const { user, loading, getRole } = useAuth();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      if (loading || !user) { setChecking(false); return; }
      const r = await getRole();
      if (on) { setRole(r); setChecking(false); }
    })();
    return () => { on = false; };
  }, [loading, user, getRole]);

  if (loading || checking) return <div style={{ padding: 24 }}>Authorizing…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (!allow.includes(role)) return <Navigate to="/no-access" replace />;

//   console.log("[RequireRole] role:", role, "allowed:", allow);
  return <Outlet />; // <-- important
}
