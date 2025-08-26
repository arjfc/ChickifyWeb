import React from "react";
import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Services from "../components/sections/Services";
import Contact from "../components/sections/Contact";
import AppView from "../assets/appView.png";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import ReviewCard from "../components/ReviewCard";
import { FaApple, FaGooglePlay } from "react-icons/fa";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <Services />
      <About />
      {/* Testimonies */}
      <div className="w-full bg-white relative z-5 pt-20 pb-30">
        <IoIosArrowDropleftCircle onClick={() => alert('clicked')} className="text-primaryYellow text-5xl absolute left-35 top-1/2 -translate-y-1/2 cursor-pointer" />
        <IoIosArrowDroprightCircle onClick={() => alert('clicked')} className="text-primaryYellow text-5xl absolute right-35 top-1/2 -translate-y-1/2 cursor-pointer" />
        <div className="flex flex-col items-center justify-center w-full mb-10">
          <h2 className="text-primaryYellow font-bold text-2xl">TESTIMONIES</h2>
          <h1 className="font-bold text-5xl">What Our Customer Says?</h1>
        </div>
        <div className="flex flex-row gap-15 justify-center items-center">
          <ReviewCard
            title="Fresh, high-quality eggs sourced from trusted farmers and checked for freshness before delivery."
            name="Jade, Jadii"
            email="jadii@gmail.com"
            rate="4"
          />
          <ReviewCard
            title="Fresh, high-quality eggs sourced from trusted farmers and checked for freshness before delivery."
            name="Jade, Jadii"
            email="jadii@gmail.com"
            rate="3"
          />
          <ReviewCard
            title="Fresh, high-quality eggs sourced from trusted farmers and checked for freshness before delivery."
            name="Jade, Jadii"
            email="jadii@gmail.com"
            rate="5"
          />
        </div>
      </div>
      {/* App View */}
      <div className="relative w-full py-10 flex items-center justify-center gap-50">
        <div className="absolute left-[-250px] top-[-150px] h-full z-5 z-0">
          <div className="relative">
            {/* Ellipse background */}
            <div className="w-[1050px] h-[1050px] bg-white rounded-full opacity-30"></div>
          </div>
        </div>
        <img src={AppView} className="relative z-10 w-2/5" />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="font-black text-4xl text-wrap">
              Chickify App is Now Available!
            </h1>
            <p className="text-xl w-2/3 text-wrap">
              Get fresh eggs anytime, anywhere! The Chickify app makes ordering
              farm-fresh eggs quick and easy.
            </p>
          </div>
          <div className="flex flex-row gap-5">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-softWhite px-4 py-2 text-black hover:bg-gray-800 hover:text-white transition"
            >
              <FaApple className="text-3xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs">Download on the</span>
                <span className="text-sm font-semibold">App Store</span>
              </div>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-softWhite px-4 py-2 text-black hover:bg-gray-800 hover:text-white  transition"
            >
              <FaGooglePlay className="text-3xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs">Get it on</span>
                <span className="text-sm font-semibold">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Contact />
    </div>
  );
}
