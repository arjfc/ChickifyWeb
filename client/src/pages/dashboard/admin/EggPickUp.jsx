import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import EggHistory from "../../../components/admin/tables/EggHistory";
import { FaRegBell } from "react-icons/fa6";
import PickupTable from "../../../components/admin/tables/PickupTable";
import Modal from "react-modal";
import { IoChevronDown, IoFilterOutline } from "react-icons/io5";
import { DatePicker } from "@mui/x-date-pickers";
const thirdModalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 30,
    maxHeight: "100vh",
    width: "35vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

export default function EggPickUp() {
  const [value, onChange] = useState(new Date());

  const [selectedType, setSelectedType] = useState("");

  const types = ["All", "Confirmation", "Complete", "Rejected"];

  const totalTrayData = [
    {
      size: "xs",
      qty: 10100,
    },
    {
      size: "sm",
      qty: 10100,
    },
    {
      size: "m",
      qty: 10100,
    },
    {
      size: "l",
      qty: 10100,
    },
    {
      size: "xl",
      qty: 10100,
    },
    {
      size: "xxl",
      qty: 10100,
    },
    {
      size: "xxxl",
      qty: 10100,
    },
  ];

  const [eggUpdateModal, setEggUpdateModal] = useState(false);

  const handleEggUpdateModal = () => {
    setEggUpdateModal(!eggUpdateModal);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Ready for pickup table */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg col-span-2 flex flex-col">
        <div className="flex flex-row justify-between items-center gap-5">
          <div className="flex flex-row gap-2 items-center text-gray-400 text-xl font-bold">
            <FaRegBell />
            <h1>Ready for Pickup Today</h1>
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-5">
              <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-transparent outline-none text-lg cursor-pointer"
                >
                  <option value="" disabled>
                    Status
                  </option>
                  {types.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div
                onClick={handleEggUpdateModal}
                className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
              >
                <p className="text-lg">Update</p>
              </div>
            </div>
          </div>
        </div>
        <PickupTable />
      </div>
      {/* Total Tray */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg col-span-1 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primaryYellow">
          Total Tray Per Size
        </h1>
        {totalTrayData.map((data) => (
          <div className="flex flex-row gap-2 items-center bg-gray-200 px-3 py-2 rounded-2xl">
            <p className="text-lg font-bold text-primaryYellow uppercase">
              {data.size}:
            </p>
            <p className="text-xl font-bold text-primaryYellow">
              {data.qty.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {/* egg history table */}
      <div className="flex flex-row items-center justify-between col-span-3">
        <h1 className="text-2xl text-primaryYellow font-bold">
          Egg Pickup History
        </h1>
        <DatePicker
          label="Filter by Date"
          onChange={(newValue) => onChange(newValue)}
        />
      </div>
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <EggHistory />
      </div>
      <Modal
        isOpen={eggUpdateModal}
        onRequestClose={handleEggUpdateModal}
        contentLabel="Egg update modal"
        style={thirdModalStyle}
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-primaryYellow mb-1">
          Update Egg Count per Size
        </h2>
        <p className="text-gray-500 mb-6">
          How many tray bundles did you pick up today per size?
        </p>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Egg Size Dropdown */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-medium">Egg Size:</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primaryYellow outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Choose Egg size
              </option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="Extra Large">Extra Large</option>
            </select>
          </div>

          {/* Tray Bundles Number Input */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-medium">
              Tray Bundles:
            </label>
            <input
              type="number"
              placeholder="e.g 10"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primaryYellow outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleEggUpdateModal}
          className="w-full bg-primaryYellow rounded-lg px-6 py-4 text-white font-semibold text-lg cursor-pointer hover:bg-yellow-500 transition"
        >
          Update Egg Count
        </button>
      </Modal>
    </div>
  );
}
