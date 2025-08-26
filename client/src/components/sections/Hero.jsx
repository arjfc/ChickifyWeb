import React from "react";
import ChickyHero from "../../assets/chickenHero.png";
import Ellipse from "../../assets/ellipse.png";
import { CiShare2 } from "react-icons/ci";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export default function Hero() {
  return (
    <div className="relative flex px-10 pt-12 pb-20" id="home">
      <div className="flex flex-col z-10 w-2/3 px-20">
        {/* Headline */}
        <p className="font-black text-[100px] leading-tight drop-shadow-custom">
          <span className="text-black">Order</span>{" "}
          <span className="text-white">Fresh Eggs</span>{" "}
          <span className="text-black">Straight from <span className="text-white italic"> Local</span></span>
          <span className="text-white italic">{" "}Farmers!</span>
        </p>

        {/* Subheading */}
        <p className="text-[25px] font-medium mt-4 w-[60%]">
          Supporting Local Farmers, Delivering Quality Eggs to Your Doorstep.
        </p>

        {/* CTA Button */}
        <button onClick={() => alert('clicked')} className="cursor-pointer my-10 bg-white text-yellow-500 font-semibold px-6 py-3 w-1/5 rounded-lg shadow-lg hover:bg-yellow-100 transition">
          Download Now
        </button>

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-6 text-2xl text-black absolute bottom-5 left-10">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <CiShare2 className="text-2xl text-black hover:text-yellow-500 transition duration-300" />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-2xl text-black hover:text-yellow-500 transition duration-300" />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="text-2xl text-black hover:text-yellow-500 transition duration-300" />
          </a>
        </div>
      </div>

      <div className="absolute right-[-150px] top-0 h-full z-5">
        <div className="relative">
          {/* Ellipse background */}
          <div className="w-[950px] h-[1000px] bg-white rounded-full opacity-30"></div>

          <img
            src={ChickyHero}
            alt="Chicky Hero"
            className="absolute top-10 left-30 z-10 w-3/5"
          />
        </div>
      </div>
    </div>
  );
}
