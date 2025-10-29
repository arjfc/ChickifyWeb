import React, { useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import SmallCard from "../../../components/super-admin/SmallCard";
import Modal from "react-modal";

const modalStyle2 = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 10,
    maxHeight: "100vh",
    width: "25vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

const sizes = [
  { size: "Extra Large", id: "xl", number: 220 },
  { size: "Large",       id: "lg", number: 200 },
  { size: "Medium",      id: "md", number: 180 },
  { size: "Small",       id: "sm", number: 150 },
  { size: "Extra Small", id: "xs", number: 120 },
];

export default function PricingManagement() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const handleInfoModal = () => setIsInfoModalOpen((s) => !s);

  return (
    <div className="flex flex-col gap-5">
      {/* Current Base Price of Tray */}
      <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-lg">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-2xl text-primaryYellow font-semibold">
              Current Base Price of Tray
            </h1>
            <FaCircleInfo
              onClick={handleInfoModal}
              className="text-lg text-gray-400 cursor-pointer"
              title="What is Price per Tray?"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {sizes.map((data) => (
            <SmallCard
              size={data.size}
              id={data.id}
              key={data.id}
              number={data.number}
            />
          ))}
        </div>
      </div>
      {/* Info modal only */}
      <Modal isOpen={isInfoModalOpen} style={modalStyle2} ariaHideApp={false}>
        <div className="flex flex-col gap-5 items-center justify-center p-6">
          <h1 className="text-primaryYellow font-bold text-xl">Price Per Tray</h1>
          <p className="font-semibold opacity-70 text-center">
            Price per Tray refers to the cost assigned to one standard tray of
            eggs (typically 30 pieces). It serves as the base unit for pricing
            in egg sales. This metric is commonly used in poultry trading
            because it standardizes egg pricing, making it simple to compare,
            track, and adjust prices across markets.
          </p>
          <div
            onClick={handleInfoModal}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 w-full text-center"
          >
            <p className="text-lg">Okay</p>
          </div>
        </div>
      </Modal>

      
    </div>
  );
}
