import React from "react";
import Egg from "../../assets/egg.png";
import Basket from "../../assets/basket.png";
import ShakeHands from "../../assets/shake-hands.png";
import ServiceCard from "../ServiceCard";

export default function Services() {
  return (
    <div className="relative flex flex-col items-center justify-center z-5 bg-white w-full pt-20 pb-50 gap-10" id="service">
         <div className="flex flex-col items-center justify-center w-full">
           <h2 className="text-primaryYellow font-bold text-2xl">OUR SERVICE</h2>
           <h1 className="font-bold text-5xl">How Does it Works?</h1>
         </div>
         <div className="flex flex-row justify-center items-center gap-10">
           <ServiceCard
             title="Egg Quality"
             description="Fresh, high-quality eggs sourced from trusted farmers and checked for freshness before delivery."
             image={Egg}
           />
           <ServiceCard
             title="Easy to Order"
             description="A hassle-free platform where you can browse, add to cart, and order in just a few clicks."
             image={Basket}
           />
           <ServiceCard
             title="Farm Direct"
             description=" Sourced directly from Bantayan Island's egg farmers, ensuring top quality."
             image={ShakeHands}
           />
         </div>
       </div>
  )
}
