import React from "react";
import ChickyHero from "../../assets/chickenHero.png";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SignUp() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center px-4 relative ">
      {/* Sign Up Card */}
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-7 md:p-8 w-full max-w-md sm:max-w-xl md:max-w-2xl z-10">
        <h2 className="text-primaryYellow font-bold text-3xl sm:text-4xl text-center mb-5">
          Sign Up
        </h2>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="fullName"
              className="font-medium text-gray-500 text-sm"
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="Full Name"
              name="fullName"
              className="border-2 border-darkRed rounded-md px-3 py-2 w-full text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="sex" className="font-medium text-gray-500 text-sm">
              Sex
            </label>
            <input
              type="text"
              placeholder="Sex"
              name="sex"
              className="border-2 border-darkRed rounded-md px-3 py-2 w-full text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="font-medium text-gray-500 text-sm"
            >
              E-mail
            </label>
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              className="border-2 border-darkRed rounded-md px-3 py-2 w-full text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="phoneNumber"
              className="font-medium text-gray-500 text-sm"
            >
              Phone
            </label>
            <input
              type="phone"
              placeholder="Phone Number"
              name="phoneNumber"
              className="border-2 border-darkRed rounded-md px-3 py-2 w-full text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="userName"
              className="font-medium text-gray-500 text-sm"
            >
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              name="userName"
              className="border-2 border-darkRed rounded-md px-3 py-2 w-full text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="font-medium text-gray-500 text-sm"
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="border-2 border-darkRed rounded-md px-3 py-2 w-full text-sm md:text-base"
            />
          </div>
        </div>

        {/* Buttons */}
        <button className="mt-5 cursor-pointer bg-primaryYellow text-white w-full py-3 rounded-md font-semibold text-base mb-3 hover:opacity-90">
          Sign Up
        </button>

        <button className="cursor-pointer bg-softPrimaryYelllow text-secondaryYellow w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 text-base">
          <FaGoogle className="text-lg" />
          Continue with Google
        </button>

        {/* Terms */}
        <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center">
          By signing up, you agree to Chickify’s{" "}
          <a href="#" className="text-primaryYellow">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-primaryYellow">
            Privacy
          </a>
          .
        </p>

        {/* Sign In link */}
        <p className="text-center text-sm mt-3">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-primaryYellow font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* Hero Illustration */}
      <div className="absolute right-[-50px] sm:right-[-100px] md:right-[-150px] top-[-150px] sm:top-[-250px] md:top-[-300px] h-full">
        <div className="relative">
          <div className="w-[500px] sm:w-[700px] md:w-[1100px] h-[600px] sm:h-[800px] md:h-[1250px] bg-white rounded-full opacity-30 relative"></div>
          <img
            src={ChickyHero}
            alt="Chicky Hero"
            className="absolute top-40 sm:top-60 md:top-115 left-20 sm:left-40 md:left-140 z-30 w-2/3 sm:w-1/2 md:w-3/7"
          />
        </div>
      </div>
    </div>
  );
}
