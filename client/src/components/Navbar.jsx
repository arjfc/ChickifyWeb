import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChickifyLogoSM from "../assets/CHICKIFY-SMALL.png";
import Button from "./Button";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ["/signin", "/signup"].includes(location.pathname);

  const jumpToSection = (section) => {
    if (isAuthPage) {
      navigate("/"); 
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative z-1 w-full flex justify-between px-20">
      <div className="flex gap-5">
        <img src={ChickifyLogoSM} className="cursor-pointer" onClick={() => navigate("/")} />
        <nav className="flex items-center">
          <ul className="flex gap-10">
            <li className="font-bold text-lg cursor-pointer hover:underline" onClick={() => jumpToSection("home")}>
              Home
            </li>
            <li className="font-bold text-lg cursor-pointer hover:underline" onClick={() => jumpToSection("service")}>
              Service
            </li>
            <li className="font-bold text-lg cursor-pointer hover:underline" onClick={() => jumpToSection("about-us")}>
              About Us
            </li>
            <li className="font-bold text-lg cursor-pointer hover:underline" onClick={() => jumpToSection("contact")}>
              Contact
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex gap-3 items-center">
        <Button title="Sign In" className="bg-white rounded-full text-lg px-7 cursor-pointer font-bold" path="/signin" />
        <Button title="Sign Up" className="rounded-xl text-lg cursor-pointer px-7 font-bold" path="/signup" />
      </div>
    </div>
  );
}
