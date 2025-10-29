// SignIn.jsx
import React, { useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ChickyHero from "../../assets/chickenHero.png";

const ROLE_HOME = {
  superadmin: "/super-admin",
  admin: "/admin",
};

export default function SignIn() {
  const nav = useNavigate();
  const loc = useLocation();
  const { getRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    setError("");
    setLoading(true);

    try {
      // Sign in (keep existing backend)
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) {
        setError(signInErr.message || "Sign in failed");
        return;
      }

      if (!data?.session?.user?.id) {
        setError("Signed in, but no session yet. Please try again.");
        return;
      }

      // Role → route (keep existing logic)
      let target = loc.state?.from?.pathname || "/no-access";
      const role = await getRole();
      if (role && ROLE_HOME[role]) target = ROLE_HOME[role];
      else if (!role) {
        setError("Your account doesn't have a role yet. Contact support.");
        return;
      }

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
      {/* Side-by-side wrapper like the SECOND CODE */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12">
        {/* Sign-in card */}
        <form
          onSubmit={handleSubmit}
         className="bg-white rounded-xl shadow-md p-8 sm:p-10 w-full md:w-[720px] lg:w-[550px]
                     h-[560px] md:h-[620px] lg:h-[500px] flex flex-col overflow-y-auto">
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
              <a href="#" className="text-primaryYellow hover:underline font-semibold">
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

          {/* <button
            type="button"
            onClick={() => alert("Google sign-in not wired yet")}
            className="bg-softPrimaryYelllow cursor-pointer text-secondaryYellow w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base"
          >
            <FaGoogle className="text-lg" /> Continue with Google
          </button> */}

          <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center leading-snug">
            By signing in, you agree to Chickify’s{" "}
            <a href="#" className="text-primaryYellow">Terms</a> and{" "}
            <a href="#" className="text-primaryYellow">Privacy</a>.
          </p>

          {/* Keep or remove this per your preference; SECOND CODE hid it */}
          {/* <p className="text-center text-sm mt-3">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-primaryYellow font-semibold hover:underline">
              Sign Up
            </Link>
          </p> */}
        </form>

        {/* Chicken Hero (fixed size, independent of form) */}
        <img
          src={ChickyHero}
          alt="Chickify Hero"
          className="w-[400px] h-auto self-center"
        />
      </div>
    </div>
  );
}



























// import React, { useRef, useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { FaGoogle } from "react-icons/fa";
// import { supabase } from "../../lib/supabase";
// import { useAuth } from "@/context/AuthContext";
// import ChickyHero from "../../assets/chickenHero.png";

// const ROLE_HOME = {
//   superadmin: "/super-admin",
//   admin: "/admin",
// };

// export default function SignIn() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const { getRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const submittingRef = useRef(false);          // <-- persistent guard

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submittingRef.current) return;
//     submittingRef.current = true;

//     setError("");
//     setLoading(true);

//     try {
//       // Sign in
//       const { data, error: signInErr } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (signInErr) {
//         setError(signInErr.message || "Sign in failed");
//         return;
//       }

//       // If we got here, the client has already stored the session (data.session)
//       if (!data?.session?.user?.id) {
//         setError("Signed in, but no session yet. Please try again.");
//         return;
//       }

//       // Resolve role → route
//       let target = loc.state?.from?.pathname || "/no-access";
//       const role = await getRole();              // uses your existing RPC
//       if (role && ROLE_HOME[role]) target = ROLE_HOME[role];
//       else if (!role) {
//         setError("Your account doesn't have a role yet. Contact support.");
//         return;
//       }

//       nav(target, { replace: true });
//     } catch (err) {
//       setError(err.message || "Sign in failed");
//     } finally {
//       setLoading(false);
//       submittingRef.current = false;
//     }
//   };

//   return (
//     <div className="flex relative min-h-screen items-center justify-center px-4 sm:px-10 md:px-20">
//       <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 sm:p-7 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl absolute top-0 left-1/2 md:left-1/5 transform -translate-x-1/2 md:translate-x-0 z-30">
//         <h2 className="text-primaryYellow font-bold text-3xl sm:text-4xl text-center mb-5">Sign In</h2>

//         <div className="flex flex-col gap-1 mb-4">
//           <label className="font-medium text-gray-500 text-sm">Email</label>
//           <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required
//                  placeholder="you@example.com"
//                  className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base" />
//         </div>

//         <div className="flex flex-col gap-1 mb-4">
//           <label className="font-medium text-gray-500 text-sm">Password</label>
//           <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required
//                  placeholder="Enter Password"
//                  className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base" />
//           <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
//             <label className="flex items-center gap-1">
//               <input type="checkbox" className="accent-yellow-500 h-4 w-4" />
//               Remember Me
//             </label>
//             <a href="#" className="text-primaryYellow hover:underline">Forgot Password?</a>
//           </div>
//         </div>

//         {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

//         <button type="submit" disabled={loading}
//                 className="cursor-pointer bg-primaryYellow text-white w-full py-3 rounded-lg font-semibold text-base mb-3 hover:opacity-90 disabled:opacity-60">
//           {loading ? "Signing in…" : "Sign In"}
//         </button>

//         <button type="button" onClick={()=>alert("Google sign-in not wired yet")}
//                 className="bg-softPrimaryYelllow cursor-pointer text-secondaryYellow w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base">
//           <FaGoogle className="text-lg" /> Continue with Google
//         </button>

//         <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center leading-snug">
//           By signing in, you agree to Chickify’s <a href="#" className="text-primaryYellow">Terms</a> and <a href="#" className="text-primaryYellow">Privacy</a>.
//         </p>

//         <p className="text-center text-sm mt-3">
//           Don’t have an account?{" "}
//           <Link to="/signup" className="text-primaryYellow font-semibold hover:underline">Sign Up</Link>
//         </p>
//       </form>

//       <div className="absolute right-[-50px] sm:right-[-100px] md:right-[-150px] top-[-150px] sm:top-[-250px] md:top-[-300px] h-full">
//         <div className="relative">
//           <div className="w-[500px] sm:w-[700px] md:w-[1100px] h-[600px] sm:h-[800px] md:h-[1250px] bg-white rounded-full opacity-30 relative"></div>
//           <img src={ChickyHero} alt="Chicky Hero" className="absolute top-40 sm:top-60 md:top-80 left-20 sm:left-40 md:left-100 z-30 w-2/3 sm:w-1/2 md:w-3/7" />
//         </div>
//       </div>
//     </div>
//   );
// }

// client/src/pages/auth/SignIn.jsx
// import React, { useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { FaGoogle } from "react-icons/fa";
// import { supabase } from "../../lib/supabase";
// import { useAuth } from "@/context/AuthContext"; // if alias isn't set, use: ../context/AuthContext
// import ChickyHero from "../../assets/chickenHero.png";

// const ROLE_HOME = {
//   superadmin: "/super-admin",
//   admin: "/admin",
// };


// export default function SignIn() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const { getRole } = useAuth(); // ← from AuthContext

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       if (!supabase) throw new Error("Supabase client not initialized.");

//       // 1) sign in
//       const { error: signInErr } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (signInErr) {
//         const msg = signInErr.message?.toLowerCase() || "";
//         if (msg.includes("email not confirmed")) {
//           throw new Error("Please confirm your email first (check your inbox).");
//         }
//         throw signInErr;
//       }

//       // 2) get role (super-admin | admin) and navigate
//       let target = loc.state?.from?.pathname || "/no-access"; // default if no prior page
//       try {
//         const role = await getRole(); // calls RPC get_my_role_name under the hood
//         target = ROLE_HOME[role] || target;
//         console.log("Resolved role:", role, "→", target);
//       } catch {
//         // leave target as fallback
//       }

//       nav(target, { replace: true });
//     } catch (err) {
//       setError(err.message || "Sign in failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex relative min-h-screen items-center justify-center px-4 sm:px-10 md:px-20">
//       {/* Sign In Card */}
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white rounded-xl shadow-md p-6 sm:p-7 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl absolute top-0 left-1/2 md:left-1/5 transform -translate-x-1/2 md:translate-x-0 z-30"
//       >
//         <h2 className="text-primaryYellow font-bold text-3xl sm:text-4xl text-center mb-5">
//           Sign In
//         </h2>

//         {/* Email */}
//         <div className="flex flex-col gap-1 mb-4">
//           <label className="font-medium text-gray-500 text-sm">Email</label>
//           <input
//             type="email"
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
//             required
//           />
//         </div>

//         {/* Password */}
//         <div className="flex flex-col gap-1 mb-4">
//           <label className="font-medium text-gray-500 text-sm">Password</label>
//           <input
//             type="password"
//             placeholder="Enter Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
//             required
//           />
//           <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
//             <label className="flex items-center gap-1">
//               <input type="checkbox" className="accent-yellow-500 h-4 w-4" />
//               Remember Me
//             </label>
//             <a href="#" className="text-primaryYellow hover:underline">
//               Forgot Password?
//             </a>
//           </div>
//         </div>

//         {/* Error */}
//         {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

//         {/* Buttons */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="cursor-pointer bg-primaryYellow text-white w-full py-3 rounded-lg font-semibold text-base mb-3 hover:opacity-90 disabled:opacity-60"
//         >
//           {loading ? "Signing in…" : "Sign In"}
//         </button>

//         <button
//           type="button"
//           onClick={() => alert("Google sign-in not wired yet")}
//           className="bg-softPrimaryYelllow cursor-pointer text-secondaryYellow w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base"
//         >
//           <FaGoogle className="text-lg" />
//           Continue with Google
//         </button>

//         {/* Terms */}
//         <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center leading-snug">
//           By signing in, you agree to Chickify’s{" "}
//           <a href="#" className="text-primaryYellow">Terms</a> and{" "}
//           <a href="#" className="text-primaryYellow">Privacy</a>.
//         </p>

//         {/* Sign Up link */}
//         <p className="text-center text-sm mt-3">
//           Don’t have an account?{" "}
//           <Link to="/signup" className="text-primaryYellow font-semibold hover:underline">
//             Sign Up
//           </Link>
//         </p>
//       </form>

//       {/* Hero */}
//       <div className="absolute right-[-50px] sm:right-[-100px] md:right-[-150px] top-[-150px] sm:top-[-250px] md:top-[-300px] h-full">
//         <div className="relative">
//           <div className="w-[500px] sm:w-[700px] md:w-[1100px] h-[600px] sm:h-[800px] md:h-[1250px] bg-white rounded-full opacity-30 relative"></div>
//           <img
//             src={ChickyHero}
//             alt="Chicky Hero"
//             className="absolute top-40 sm:top-60 md:top-80 left-20 sm:left-40 md:left-100 z-30 w-2/3 sm:w-1/2 md:w-3/7"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
