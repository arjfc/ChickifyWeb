import React from "react";
import { FaQuoteLeft } from "react-icons/fa6";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function ReviewCard(props) {
  const rate = parseInt(props.rate);
  return (
    <div className="flex flex-col relative z-5 gap-5 px-5 py-10 rounded-3xl shadow-2xl border border-gray-200  transition-transform hover:scale-105">
      <FaQuoteLeft className="text-primaryYellow text-7xl" />
      <div className="">
        <p className="w-[300px] max-w-3/4 mb-10 font-semibold text-lg">
          {props.title}
        </p>

        <div className="mb-5">
          <h1 className="font-bold text-lg">{props.name}</h1>
          <h5 className="opacity-50">{props.email}</h5>
        </div>

        <hr />
        <div className="flex flex-row justify-between mt-5">
          {[...Array(5)].map((_, index) =>
            index < rate ? (
              <FaStar key={index} className="text-primaryYellow text-4xl" />
            ) : (
              <FaRegStar key={index} className="text-primaryYellow text-4xl" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
