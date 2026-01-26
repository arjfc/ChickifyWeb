// import React, { useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../../lib/supabase";
// import ChickyHero from "../../assets/chickenHero.png";
// import ChickifyLogo from "../../assets/CHICKIFY.png";

// const ROLE_HOME = {
//   superadmin: "/super-admin",
//   admin: "/admin",
// };

// export default function SignIn() {
//   const nav = useNavigate();
//   const loc = useLocation();

//   // ✅ Email OR Username input
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const submittingRef = useRef(false);

//   // 🔸 Call the role RPC directly (don’t depend on context.user here)
//   const getRoleDirect = async () => {
//     const { data, error } = await supabase.rpc("get_role_web");
//     if (error) throw error;
//     return data ? String(data).toLowerCase() : null; // 'admin' | 'superadmin' | null
//   };

//   const ensureUser = async () => {
//     const { data: first } = await supabase.auth.getUser();
//     if (first?.user) return first.user;

//     await new Promise((r) => setTimeout(r, 150));
//     const { data: second } = await supabase.auth.getUser();
//     if (second?.user) return second.user;

//     throw new Error("Signed in, but user session not ready yet.");
//   };

//   // ✅ Resolve "identifier" into an email (email stays email; username -> lookup -> email)
//   const resolveEmail = async (raw) => {
//     const value = String(raw || "").trim();
//     if (!value) throw new Error("Please enter your email or username.");

//     // If it looks like an email, use it directly
//     if (value.includes("@")) return value.toLowerCase();

//     // Otherwise treat as username -> get email via RPC
//     const { data, error } = await supabase.rpc("get_email_by_username", {
//       p_username: value,
//     });
//     if (error) throw new Error(error.message || "Failed to lookup username.");

//     // your RPC returns TABLE -> array of rows
//     const row = Array.isArray(data) ? data[0] : null;
//     const email = row?.email ? String(row.email).trim().toLowerCase() : "";

//     if (!email) throw new Error("Username not found. Please check and try again.");
//     return email;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submittingRef.current) return;
//     submittingRef.current = true;

//     setError("");
//     setLoading(true);

//     try {
//       // 0) Convert identifier -> email if needed
//       const emailToUse = await resolveEmail(identifier);

//       // 1) Sign in with resolved email
//       const { error: signInErr } = await supabase.auth.signInWithPassword({
//         email: emailToUse,
//         password,
//       });
//       if (signInErr) throw new Error(signInErr.message || "Sign in failed");

//       // 2) Ensure we actually have the fresh user session
//       await ensureUser();

//       // 3) Get role and route
//       const role = await getRoleDirect();
//       if (!role || !ROLE_HOME[role]) {
//         throw new Error("Your account doesn't have a role yet. Contact support.");
//       }

//       const fallback = ROLE_HOME[role];
//       const fromState = loc.state?.from?.pathname;
//       const target =
//         fromState && fromState !== "/no-access" ? fromState : fallback;

//       // 4) Navigate
//       nav(target, { replace: true });
//     } catch (err) {
//       setError(err?.message || "Sign in failed");
//     } finally {
//       setLoading(false);
//       submittingRef.current = false;
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 sm:px-10 md:px-20">
//       <div className="flex flex-col md:flex-row items-center justify-center gap-12">
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white rounded-xl shadow-md p-8 sm:p-10 w-full md:w-[720px] lg:w-[550px]
//                      h-[560px] md:h-[620px] lg:h-[500px] flex flex-col overflow-y-auto"
//         >
//           <h2 className="text-primaryYellow font-bold text-3xl sm:text-4xl text-center mb-5">
//             Sign In
//           </h2>

//           {/* Email / Username */}
//           <div className="flex flex-col gap-1 mb-4">
//             <label className="font-medium text-gray-500 text-sm">
//               Email or Username
//             </label>
//             <input
//               type="text"
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//               required
//               placeholder="you@example.com or yourusername"
//               autoComplete="username"
//               className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
//             />
//           </div>

//           {/* Password */}
//           <div className="flex flex-col gap-1 mb-4">
//             <label className="font-medium text-gray-500 text-sm">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder="Enter Password"
//               autoComplete="current-password"
//               className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
//             />
//             <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-4">
//               <label className="flex items-center gap-1">
//                 <input type="checkbox" className="accent-yellow-500 h-4 w-4" />
//                 Remember Me
//               </label>
//               <a href="#" className="text-primaryYellow hover:underline font-semibold">
//                 Forgot Password?
//               </a>
//             </div>
//           </div>

//           {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="cursor-pointer bg-primaryYellow text-white w-full py-3 rounded-lg font-semibold text-base mb-3 hover:opacity-90 disabled:opacity-60 mt-2"
//           >
//             {loading ? "Signing in…" : "Sign In"}
//           </button>

//           <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center leading-snug">
//             By signing in, you agree to Chickify’s{" "}
//             <a href="#" className="text-primaryYellow">
//               Terms
//             </a>{" "}
//             and{" "}
//             <a href="#" className="text-primaryYellow">
//               Privacy
//             </a>
//             .
//           </p>
//         </form>

//         {/* Hero + CHICKIFY image (right side) */}
//         <div className="relative w-[420px] h-[560px]">
//           <img
//             src={ChickyHero}
//             alt="Chickify Hero"
//             className="absolute top-1 left-1/2 -translate-x-1/2 w-[400px] h-auto"
//           />
//           <img
//             src={ChickifyLogo}
//             alt="Chickify Logo"
//             className="absolute top-[265px] left-[62%] -translate-x-1/2 w-[450px] h-auto"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ChickyHero from "../../assets/chickenHero.png";
import ChickifyLogo from "../../assets/CHICKIFY.png"; // ⬅️ adjust path/name if different

const ROLE_HOME = {
  superadmin: "/super-admin",
  admin: "/admin",
};

export default function SignIn() {
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  // 🔸 Call the role RPC directly (don’t depend on context.user here)
  const getRoleDirect = async () => {
    const { data, error } = await supabase.rpc("get_role_web");
    if (error) throw error;
    return data ? String(data).toLowerCase() : null; // 'admin' | 'superadmin' | null
  };

  const ensureUser = async () => {
    // Sometimes the user isn’t immediately available right after signIn
    const { data: first } = await supabase.auth.getUser();
    if (first?.user) return first.user;

    // tiny retry once
    await new Promise((r) => setTimeout(r, 150));
    const { data: second } = await supabase.auth.getUser();
    if (second?.user) return second.user;

    throw new Error("Signed in, but user session not ready yet.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    setError("");
    setLoading(true);

    try {
      // 1) Sign in
      const { data, error: signInErr } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      if (signInErr) throw new Error(signInErr.message || "Sign in failed");

      // 2) Ensure we actually have the fresh user session
      await ensureUser();
      const role = await getRoleDirect();
      if (!role || !ROLE_HOME[role]) {
        throw new Error("Your account doesn't have a role yet. Contact support.");
      }

      // 4) Decide target route
      const fallback = ROLE_HOME[role];
      const fromState = loc.state?.from?.pathname;
      const target = fromState && fromState !== "/no-access" ? fromState : fallback;

      // 5) Navigate
      nav(target, { replace: true });
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-10 md:px-20">
      <div className="flex flex-col md:flex-row items-center justify-center gap-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 sm:p-10 w-full md:w-[720px] lg:w-[550px]
                     h-[560px] md:h-[620px] lg:h-[500px] flex flex-col overflow-y-auto"
        >
          <h2 className="text-primaryYellow font-bold text-3xl sm:text-4xl text-center mb-5">
            Sign In
          </h2>

          {/* Email */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="font-medium text-gray-500 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="font-medium text-gray-500 text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter Password"
              autoComplete="current-password"
              className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
            />
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-4">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-yellow-500 h-4 w-4" />
                Remember Me
              </label>
              <a
                href="#"
                className="text-primaryYellow hover:underline font-semibold"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-primaryYellow text-white w-full py-3 rounded-lg font-semibold text-base mb-3 hover:opacity-90 disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center leading-snug">
            By signing in, you agree to Chickify’s{" "}
            <a href="#" className="text-primaryYellow">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-primaryYellow">
              Privacy
            </a>
            .
          </p>
        </form>

       {/* Hero + CHICKIFY image (right side) */}
<div className="relative w-[420px] h-[560px]">
  {/* ChickyHero – slightly lower */}
  <img
    src={ChickyHero}
    alt="Chickify Hero"
    className="absolute top-1 left-1/2 -translate-x-1/2 w-[400px] h-auto"
  />

  {/* CHICKIFY logo – same size, under hero, a bit to the right */}
  <img
    src={ChickifyLogo}
    alt="Chickify Logo"
    className="absolute top-[265px] left-[62%] -translate-x-1/2 w-[450px] h-auto"
  />
</div>

      </div>
    </div>
  );
}
