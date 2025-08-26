import React, { useState } from "react";
import { IoMdOptions } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import OrderTable from "../../../components/admin/tables/OrderTable";
import Modal from "react-modal";

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

export default function OrderStatus() {
  const navigate = useNavigate();
  const options = ["Pending", "Completed", "Canceled", "Refunded"];
  const [selectedOption, setSelectedAdminOption] = useState("Pending");
  const [updateModal, setIsUpdateModal] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatusType, setSelectedStatusType] = useState("On delivery");
  const statusType = ["On delivery", "Delivered", "Packing"];
  const [confirmationModal, setConfirmationModal] = useState(false);

  const handleSelect = (type) => {
    setSelectedStatusType(type);
    setIsDropdownOpen(false);
  };

  function handleUpdateModal() {
    setIsUpdateModal(!updateModal);
  }

  function handleUpdateStatus() {
    setIsUpdateModal(false);
    setConfirmationModal(true);
  }

  const handleConfirmationModal = () => {
    setConfirmationModal(false);
    navigate("/admin/products/egg-pickup");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          {options.map((data) => (
            <div
              key={data}
              onClick={() => setSelectedAdminOption(data)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-sm sm:text-base transition-colors ${
                selectedOption === data
                  ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
                  : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
              }`}
            >
              {data}
            </div>
          ))}
          <IoMdOptions
            onClick={() => alert("clicked")}
            className="text-lg text-gray-400 cursor-pointer"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 sm:gap-5 items-center">
          <div
            onClick={() => alert("clicked")}
            className="bg-gray-500 text-white font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base cursor-pointer hover:opacity-90"
          >
            Cancel
          </div>
          <div
            onClick={handleUpdateModal}
            className="bg-softSecondaryYellow text-black font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base cursor-pointer hover:opacity-90"
          >
            Update
          </div>
          <div
            onClick={() => alert("clicked")}
            className="bg-primaryYellow text-white font-medium rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base cursor-pointer hover:opacity-90"
          >
            Mark as Complete
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        onClick={() => alert("clicked")}
        className="p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto"
      >
        <OrderTable selectedOption={selectedOption} />
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={updateModal}
        onRequestClose={handleUpdateModal}
        contentLabel="Update Order Status"
        style={{
          ...modalBaseStyle,
          content: { ...modalBaseStyle.content, width: "90%", maxWidth: "500px" },
        }}
      >
        <div className="flex flex-col gap-5 px-3 py-6">
          <h1 className="text-primaryYellow text-fluid-xl text-center font-bold">
            Update Order Status
          </h1>
          <div className="flex flex-col">
            <h1 className="text-gray-400 text-sm sm:text-base">Current status:</h1>
            <p className="text-primaryYellow text-base sm:text-lg font-semibold">
              Pending
            </p>
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-400 text-sm sm:text-base">Update status:</h1>
            <div className="relative">
              <div
                className="flex items-center justify-between gap-2 shadow-xl border border-gray-300 text-primaryYellow font-medium rounded-lg px-4 py-2 cursor-pointer hover:opacity-90"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <p className="text-sm sm:text-base">{selectedStatusType}</p>
                <IoChevronDown
                  className={`transform transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {statusType.map((type, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm sm:text-base"
                      onClick={() => handleSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleUpdateModal}
              className="bg-gray-400 rounded-lg px-4 sm:px-6 py-2 text-white text-sm sm:text-base font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              className="bg-primaryYellow rounded-lg px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base hover:bg-yellow-500 transition"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModal}
        onRequestClose={handleConfirmationModal}
        contentLabel="Confirm Status"
        style={{
          ...modalBaseStyle,
          content: { ...modalBaseStyle.content, width: "90%", maxWidth: "400px" },
        }}
      >
        <div className="flex flex-col justify-center items-center p-6 text-center">
          <h1 className="text-primaryYellow font-bold text-fluid-2xl">
            Pickup Complete!
          </h1>
          <p className="text-gray-400 mb-6 sm:mb-10 text-base sm:text-xl">
            Farmer Name here
          </p>
          <div
            onClick={handleConfirmationModal}
            className="w-full bg-primaryYellow shadow-md rounded-lg text-white px-4 py-3 font-bold cursor-pointer hover:bg-yellow-500 transition"
          >
            Update Egg Count
          </div>
        </div>
      </Modal>
    </div>
  );
}
