import React, { useState } from "react";
import ProductTable from "../../../components/super-admin/tables/ProductTable";
import Modal from "react-modal";

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 10,
    maxHeight: "100vh",
    width: "50vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

export default function ProductManagement() {
  const [selectedType, setSelectedType] = useState("");

  const types = ["All", "Egg", "Itlog", "Chicken"];

  // const [selectedType, setSelectedType] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [btnType, setBtnType] = useState("");
    // const types = ["All", "Egg", "Itlog", "Size"];
  
    const handleModal = (type) => {
      setIsModalOpen(!isModalOpen);
      setBtnType(type);
    };
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between items-center">
        {/* Dropdown */}
        <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent outline-none text-lg cursor-pointer"
          >
            <option value="" disabled>
              Filter by Type
            </option>
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-5 h-full items-end">
          <div onClick={() => handleModal("Edit")} className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90">
            <p className="text-lg">Edit Product</p>
          </div>
          <div onClick={() => handleModal("Add")} className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90">
            <p className="text-lg">Add Product</p>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ProductTable option={selectedType} />
      </div>
      <Modal isOpen={isModalOpen} style={modalStyle}>
        <div className="flex flex-col p-10 space-y-6">
          <h1 className="text-primaryYellow text-2xl font-bold text-center">
            {btnType} Product Details
          </h1>

          <div className="grid grid-cols-2 gap-5">
            {/* Upload Product Image */}
            <label className="flex items-center justify-center border rounded-lg p-3 cursor-pointer col-span-1 row-span-2 text-gray-400 hover:bg-gray-100 shadow-lg">
              <span>Upload Product Image</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>

            <div className="flex flex-col gap-10 row-span-2">
              {/* Category Dropdown */}
              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">Category</label>
                <select className="border rounded-lg p-3 text-gray-400 shadow-md">
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="egg">Egg</option>
                  <option value="meat">Meat</option>
                  <option value="vegetables">Vegetables</option>
                </select>
              </div>

              {/* Product Title */}
              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">
                  Product Title
                </label>
                <input
                  type="text"
                  placeholder="Enter product title"
                  className="border rounded-lg p-3 text-gray-400 shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-gray-400">
              Product Description
            </label>
            <textarea
              placeholder="Enter product description"
              className="border rounded-lg p-3 resize-none shadow-md text-gray-400"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-row items-center justify-between gap-5">
            <div
              onClick={() => handleModal("Add")}
              className="flex-1 text-center bg-gray-400 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-lg">Cancel</p>
            </div>
            <div
              onClick={() => handleModal("Add")}
              className="flex-1 text-center bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-lg">Save Changes</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
