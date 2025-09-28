// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import { supabase } from "../lib/supabase"; // keep relative unless you set "@/"

// const AuthCtx = createContext({
//   session: null,
//   user: null,
//   loading: true,
//   signIn: async () => {},
//   signUp: async () => {},
//   signOut: async () => {},
//   getRole: async () => null, // call when you need the role
// });

// export function AuthProvider({ children }) {
//   const [session, setSession]   = useState(null);
//   const [user, setUser]         = useState(null);
//   const [loading, setLoading]   = useState(true);

//   // Initial session + listener
//   useEffect(() => {
//     let mounted = true;

//     if (!supabase) { // safe if envs missing
//       setLoading(false);
//       return;
//     }

//     supabase.auth.getSession().then(({ data }) => {
//       if (!mounted) return;
//       const s = data?.session ?? null;
//       setSession(s);
//       setUser(s?.user ?? null);
//       setLoading(false);
//     });

//     const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
//       setSession(s ?? null);
//       setUser(s?.user ?? null);
//     });

//     return () => {
//       mounted = false;
//       sub?.subscription?.unsubscribe?.();
//     };
//   }, []);

//   // --- helpers you can use anywhere ---
//   const signIn = async ({ email, password }) => {
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//     return data;
//   };

//   const signUp = async ({ email, password, options }) => {
//     const { data, error } = await supabase.auth.signUp({ email, password, options });
//     if (error) throw error;
//     return data;
//   };

//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) throw error;
//   };

//     const getRole = async () => {
//     if (!user) return null;
//     const { data, error } = await supabase.rpc("get_my_role_name");
//     if (error) return null;
//     return data ? String(data).toLowerCase() : null; // 'super-admin' | 'admin' | null
//   };
  
//   // // Fetch role only when you need it (adjust to your schema/RPC)
//   // const getRole = async () => {
//   //   if (!user) return null;
//   //   // Option A: RPC you already use on mobile
//   //   const { data, error } = await supabase.rpc("get_my_role_name");
//   //   if (!error && data) return String(data).toLowerCase();

//   //   // Option B (if you prefer table join):
//   //   // const { data, error } = await supabase
//   //   //   .from("app_users")
//   //   //   .select("role:role(role_name)")
//   //   //   .eq("user_id", user.id)
//   //   //   .single();
//   //   // return (!error && data?.role?.role_name) ? data.role.role_name.toLowerCase() : null;

//   //   return null;
//   // };

//   const value = useMemo(
//     () => ({ session, user, loading, signIn, signUp, signOut, getRole }),
//     [session, user, loading]
//   );

//   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthCtx);
// }
// AuthContext.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthCtx = createContext({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  getRole: async () => null,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const s = data?.session ?? null;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      // keep state in sync with Supabase events
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      } else {
        setSession(s ?? null);
        setUser(s?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // ---------- auth helpers ----------
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, options }) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options });
    if (error) throw error;
    return data;
  };

  // ✅ Fully clear session *and* in-memory state
  const signOut = async (scope = "local") => {
    const { error } = await supabase.auth.signOut({ scope }); // "local" or "global"
    if (error) throw error;

    // proactively clear local state so UI updates immediately
    setSession(null);
    setUser(null);

    // (optional) nuke stubborn dev tokens if you still see ghost sessions
    // Object.keys(localStorage)
    //   .filter(k => k.startsWith("sb-") && k.endsWith("-auth-token"))
    //   .forEach(k => localStorage.removeItem(k));
  };

  // context/AuthContext.jsx
  const getRole = async () => {
    if (!user) return null;
    const { data, error } = await supabase.rpc("get_role_web");
    if (error) throw error;
    return data ? String(data).toLowerCase() : null;  // 'admin' | 'superadmin'
  };

  const value = useMemo(
    () => ({ session, user, loading, signIn, signUp, signOut, getRole }),
    [session, user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
