import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChickyHero from "../../assets/chickenHero.png";

export default function SignIn() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="flex relative min-h-screen items-center justify-center px-4 sm:px-10 md:px-20">
      {/* Sign In Card */}
     <form
  onSubmit={handleSubmit}
  className="bg-white rounded-xl shadow-md p-6 sm:p-7 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl absolute top-0 left-1/2 md:left-1/5 transform -translate-x-1/2 md:translate-x-0 z-30"
>
  <h2 className="text-primaryYellow font-bold text-3xl sm:text-4xl text-center mb-5">
    Sign In
  </h2>

  {/* Username */}
  <div className="flex flex-col gap-1 mb-4">
    <label className="font-medium text-gray-500 text-sm">Username</label>
    <input
      type="text"
      placeholder="Enter Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
    />
  </div>

  {/* Password */}
  <div className="flex flex-col gap-1 mb-4">
    <label className="font-medium text-gray-500 text-sm">Password</label>
    <input
      type="password"
      placeholder="Enter Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="border-2 border-darkRed rounded-lg px-3 py-3 w-full text-base"
    />
    <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
      <label className="flex items-center gap-1">
        <input type="checkbox" className="accent-yellow-500 h-4 w-4" />
        Remember Me
      </label>
      <a href="#" className="text-primaryYellow hover:underline">
        Forgot Password?
      </a>
    </div>
  </div>

  {/* Error message */}
  {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

  {/* Buttons */}
  <button
    type="submit"
    className="cursor-pointer bg-primaryYellow text-white w-full py-3 rounded-lg font-semibold text-base mb-3 hover:opacity-90"
  >
    Sign In
  </button>

  <button
    type="button"
    onClick={() => alert('clicked')}
    className="bg-softPrimaryYelllow cursor-pointer text-secondaryYellow w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-base"
  >
    <FaGoogle className="text-lg" />
    Continue with Google
  </button>

  {/* Terms */}
  <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center leading-snug">
    By signing in, you agree to Chickify’s{" "}
    <a href="#" className="text-primaryYellow">Terms</a> and{" "}
    <a href="#" className="text-primaryYellow">Privacy</a>.
  </p>

  {/* Sign Up link */}
  <p className="text-center text-sm mt-3">
    Don’t have an account?{" "}
    <Link
      to="/signup"
      className="text-primaryYellow font-semibold hover:underline"
    >
      Sign Up
    </Link>
  </p>
</form>



      {/* Hero */}
      <div className="absolute right-[-50px] sm:right-[-100px] md:right-[-150px] top-[-150px] sm:top-[-250px] md:top-[-300px] h-full">
        <div className="relative">
          <div className="w-[500px] sm:w-[700px] md:w-[1100px] h-[600px] sm:h-[800px] md:h-[1250px] bg-white rounded-full opacity-30 relative"></div>
          <img
            src={ChickyHero}
            alt="Chicky Hero"
            className="absolute top-40 sm:top-60 md:top-80 left-20 sm:left-40 md:left-100 z-30 w-2/3 sm:w-1/2 md:w-3/7"
          />
        </div>
      </div>
    </div>
  );
}
