import React, { useState } from "react";
import Card from "../../../components/Card";
import { IoFilterOutline } from "react-icons/io5";
import ProductTable from "../../../components/admin/tables/ProductTable";
import Modal from "react-modal";
import TrayEggImg from "../../../assets/tray-egg.png";

const modalBaseStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 20,
    maxHeight: "100vh",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

const sizes = [
  { size: "Extra Small", id: "xs", isAvailable: true },
  { size: "Small", id: "sm", isAvailable: true },
  { size: "Medium", id: "md", isAvailable: true },
  { size: "Large", id: "lg", isAvailable: true },
  { size: "Extra Large", id: "xl", isAvailable: true },
  { size: "Jumbo", id: "xxl", isAvailable: false },
  { size: "Super Jumbo", id: "xxxl", isAvailable: false },
];

export default function ProductDetails() {
  const [selectedType, setSelectedType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnType, setBtnType] = useState("");
  const types = ["All", "Egg", "Itlog", "Size"];

  const handleModal = (type) => {
    setIsModalOpen(!isModalOpen);
    setBtnType(type);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* LEFT CARD */}
      <div className="flex flex-col gap-5 lg:flex-row w-full col-span-2">
        <Card>
          <div className="flex flex-col gap-3">
            <h1 className="text-base md:text-lg text-gray-400 font-bold italic">
              Category: Egg
            </h1>
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <div className="p-4 bg-softSecondaryYellow shadow-md rounded-lg">
                <img src={TrayEggImg} alt="Egg Tray" className="w-40 sm:w-50" />
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <h1 className="text-primaryYellow font-bold text-xl sm:text-2xl">
                  Tray of Egg
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Enjoy the taste of farm-fresh goodness! Our eggs are carefully
                  selected to bring you the best quality and freshness.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* RIGHT CARD */}
        <Card>
          <div className="flex flex-col gap-5">
            <h1 className="text-gray-400 text-lg font-bold">
              Recently Available Sizes
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {sizes.map((data) => (
                <div
                  key={data.id}
                  className={`px-3 py-2 rounded-full text-xs sm:text-sm font-bold ${
                    data.isAvailable
                      ? "bg-softSecondaryYellow text-primaryYellow"
                      : "bg-gray-300 text-gray-400"
                  }`}
                >
                  {data.size}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER + ACTIONS */}
      <div className="col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Dropdown */}
        <div className="flex flex-row items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600 bg-white text-sm sm:text-base"
          >
            <option value="" disabled>
              Filter by Category
            </option>
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            onClick={() => alert("clicked")}
            className="flex items-center border rounded-lg px-3 sm:px-5 py-2 text-gray-600 hover:border-primaryYellow hover:text-primaryYellow"
          >
            <IoFilterOutline />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 sm:gap-5">
          <button
            onClick={() => handleModal("Edit")}
            className="cursor-pointer bg-gray-500 text-white text-sm sm:text-lg font-medium rounded-lg px-4 sm:px-5 py-2 hover:opacity-90"
          >
            Edit Product
          </button>
          <button
            onClick={() => handleModal("Add")}
            className="cursor-pointer bg-primaryYellow text-white text-sm sm:text-lg font-medium rounded-lg px-4 sm:px-5 py-2 hover:opacity-90"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="col-span-2 p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
        <ProductTable type={selectedType} />
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        style={{
          ...modalBaseStyle,
          content: {
            ...modalBaseStyle.content,
            width: "90%",
            maxWidth: "600px",
          },
        }}
      >
        <div className="flex flex-col p-4 sm:p-8 space-y-6">
          <h1 className="text-primaryYellow text-xl sm:text-2xl font-bold text-center">
            {btnType} Product Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Upload Product Image */}
            <label className="flex items-center justify-center border rounded-lg p-3 cursor-pointer text-gray-400 hover:bg-gray-100 shadow-md h-32 sm:h-auto">
              <span>Upload Product Image</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>

            <div className="flex flex-col gap-5">
              {/* Category */}
              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">Category</label>
                <select className="border rounded-lg p-3 text-gray-600 shadow-md">
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="egg">Egg</option>
                  <option value="meat">Meat</option>
                  <option value="vegetables">Vegetables</option>
                </select>
              </div>

              {/* Title */}
              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">
                  Product Title
                </label>
                <input
                  type="text"
                  placeholder="Enter product title"
                  className="border rounded-lg p-3 text-gray-600 shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-gray-400">
              Product Description
            </label>
            <textarea
              placeholder="Enter product description"
              className="border rounded-lg p-3 resize-none shadow-md text-gray-600"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-400 text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
