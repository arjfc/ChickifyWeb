import React, { useState } from "react";
import DiscountTable from "../../../components/admin/tables/DiscountTable";
import Modal from "react-modal";
import { MdKeyboardArrowDown } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers";
import { IoFilterOutline } from "react-icons/io5";

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    maxHeight: "100vh",
    width: "35vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

export default function DiscountManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnType, setBtnType] = useState("");

  // form state
  const [formData, setFormData] = useState({
    code: "",
    method: "",
    amount: "",
    items: "",
    maxUse: "",
    validFrom: null,
    validUntil: null,
  });

  const [value, onChange] = useState(new Date());

  const handleModal = (type) => {
    setIsModalOpen(!isModalOpen);
    setBtnType(type);
    if (!isModalOpen) {
      if (type.includes("Add")) {
        setFormData({
          code: "",
          method: "",
          amount: "",
          items: "",
          maxUse: "",
          validFrom: null,
          validUntil: null,
        });
      }
    }
  };

  // generic input handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // save form
  const handleSave = () => {
    console.log("Form Submitted ✅:", formData);

    // e.g. axios.post("/api/discounts", formData)

    setIsModalOpen(false); // close modal after save
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="col-span-2 flex items-center justify-between">
        <div className="flex flex-row items-center gap-3">
          <div
            onClick={() => handleModal("Add New")}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Add New Discount</p>
          </div>
          <div className="flex items-center cursor-pointer rounded-xl px-5 py-3 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold">
            <IoFilterOutline />
          </div>
        </div>
        <div className="flex gap-5 h-full items-end">
          <div className=" text-black border font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90">
            <p className="text-lg">Archive Discount</p>
          </div>
          <div
            onClick={() => handleModal("Edit")}
            className="bg-primaryYellow text-black font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Edit Discount</p>
          </div>
        </div>
      </div>

      <div className="col-span-2 p-6 rounded-lg border border-gray-200 shadow-lg">
        <DiscountTable />
      </div>

      <Modal isOpen={isModalOpen} style={modalStyle}>
        <div className="flex flex-col px-4 py-2 space-y-2">
          <h1 className="text-primaryYellow text-2xl font-bold text-center">
            {btnType} Discount
          </h1>

          <div className="grid grid-cols-3 gap-2">
            {/* Code & Method */}
            <div className="col-span-3 flex flex-row gap-2">
              <div className="flex w-full flex-col">
                <label className="mb-2 font-bold text-gray-400">Code</label>
                <input
                  type="text"
                  placeholder="e.g. FRESHEGG"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  className="border rounded-lg p-3 text-gray-400 shadow-md"
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-2 font-bold text-gray-400">
                  Discount Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => handleChange("method", e.target.value)}
                  className="border rounded-lg p-3 text-gray-400 shadow-md"
                >
                  <option className="text-gray-200" value="" disabled>
                    Select a category
                  </option>
                  <option value="fix">Fix</option>
                  <option value="percentage">Percentage</option>
                  <option value="Volume">Volume</option>
                </select>
              </div>
            </div>

            {/* Amount */}
            <div className="col-span-2">
              <label className="mb-2 font-bold text-gray-400">
                {formData.method === "" && "Amount"}
                {formData.method === "fix" && "Amount"}
                {formData.method === "percentage" && "Percentage"}
                {formData.method === "Volume" && "Amount per Item"}
              </label>
              <input
                type="text"
                placeholder="e.g. Php100 Off"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="border rounded-lg p-3 text-gray-400 shadow-md w-full"
              />
            </div>

            {/* Items & Max Use */}
            <div className="col-span-1 flex flex-row gap-2">
              <div className="flex-1">
                <label className="mb-2 font-bold text-gray-400">Item</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.items}
                  onChange={(e) => handleChange("items", e.target.value)}
                  className="border rounded-lg p-3 text-gray-400 shadow-md w-full"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 font-bold text-gray-400">Max Use</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.maxUse}
                  onChange={(e) => handleChange("maxUse", e.target.value)}
                  className="border rounded-lg p-3 text-gray-400 shadow-md w-full"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="col-span-3 flex flex-row gap-5">
              {/* Valid From */}
              <div className="w-full">
                <label className="mb-2 font-bold text-gray-400">
                  Valid From
                </label>
                <DatePicker
                  label="Valid From"
                  onChange={(newValue) => onChange(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: 220 }, // 👈 set width here
                    },
                  }}
                />
              </div>

              {/* Valid Until */}
              <div className="w-full">
                <label className="mb-2 font-bold text-gray-400">
                  Valid Until
                </label>
                <DatePicker
                  label="Valid Until"
                  onChange={(newValue) => onChange(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: 220 }, // 👈 set width here
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row items-center justify-between gap-5 mt-5">
            <div
              onClick={() => setIsModalOpen(false)}
              className="flex-1 text-center bg-gray-400 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-lg">Cancel</p>
            </div>
            <div
              onClick={handleSave}
              className="flex-1 text-center bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-lg">
                {btnType.includes("Add") ? "Add New Discount" : "Save Changes"}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
