import React, { useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import SmallCard from "../../../components/super-admin/SmallCard";
import PricingTable from "../../../components/super-admin/tables/PricingTable";
import { IoFilterOutline } from "react-icons/io5";
import Modal from "react-modal";
import { MdKeyboardArrowDown } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers";

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
    width: "35vw",
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};
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
  {
    size: "Extra Large",
    id: "xl",
    number: 220,
  },
  {
    size: "Large",
    id: "lg",
    number: 200,
  },
  {
    size: "Medium",
    id: "md",
    number: 180,
  },
  {
    size: "Small",
    id: "sm",
    number: 150,
  },
  {
    size: "Extra Small",
    id: "xs",
    number: 120,
  },
];

export default function PricingManagement() {
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

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleInfoModal = () => {
    setIsInfoModalOpen(!isInfoModalOpen);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 p-6 rounded-lg border border-gray-200 shadow-lg">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="text-2xl text-primaryYellow font-semibold">
              Current Base Price of Tray
            </h1>
            <FaCircleInfo
              onClick={handleInfoModal}
              className="text-lg text-gray-400 cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="col-span-2 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div
              onClick={() => handleModal("Add New")}
              className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
              <p className="text-lg">Add New Discount</p>
            </div>
            <div className="flex items-center cursor-pointer rounded-xl px-5 py-3 transition-colors border-gray-300 border text-lg hover:border-primaryYellow hover:text-primaryYellow hover:font-bold">
              <IoFilterOutline onClick={() => alert("clicked")} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5 h-full items-start md:flex-end">
            <div
              onClick={() => alert("clicked")}
              className=" text-black border font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
            >
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
          <PricingTable />
        </div>

        <Modal isOpen={isModalOpen} style={modalStyle}>
          <div className="flex flex-col px-4 py-2 space-y-4">
            <h1 className="text-primaryYellow text-2xl font-bold text-center">
              {btnType} Discount
            </h1>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <div className="col-span-1">
                <div className="flex-1 flex flex-col">
                  <label className="mb-1 font-bold text-gray-400">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FRESHEGG"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    className="border rounded-md px-3 py-2 text-gray-400 shadow-sm text-sm"
                  />
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex-1 flex flex-col">
                  <label className="mb-1 font-bold text-gray-400">Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => handleChange("method", e.target.value)}
                    className="border rounded-md px-3 py-2 text-gray-400 shadow-sm text-sm"
                  >
                    <option value="" disabled>
                      Select method
                    </option>
                    <option value="fix">Fix</option>
                    <option value="percentage">Percentage</option>
                    <option value="Volume">Volume</option>
                  </select>
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex-1 w-full col-span-1">
                  <label className="mb-1 font-bold text-gray-400">
                    {formData.method === "" && "Amount"}
                    {formData.method === "fix" && "Amount"}
                    {formData.method === "percentage" && "Percentage"}
                    {formData.method === "Volume" && "Amount/Item"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Php100 Off"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="border rounded-md px-3 py-2 text-gray-400 shadow-sm text-sm w-full"
                  />
                </div>
              </div>
              <div className="col-span-1 gap-3">
                <div className="flex flex-row gap-3 col-span-1">
                  <div className="flex-1">
                    <label className="mb-1 font-bold text-gray-400">
                      Items
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={formData.items}
                      onChange={(e) => handleChange("items", e.target.value)}
                      className="border rounded-md px-3 py-2 text-gray-400 shadow-sm text-sm w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 font-bold text-gray-400">
                      Max Use
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={formData.maxUse}
                      onChange={(e) => handleChange("maxUse", e.target.value)}
                      className="border rounded-md px-3 py-2 text-gray-400 shadow-sm text-sm w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-1 flex flex-1 flex-col gap-1">
                <label className="font-bold text-gray-400">Valid From</label>
                <DatePicker
                  label="Select Date"
                  onChange={(newValue) => onChange(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        width: "100%",
                        "@media (min-width: 1280px)": {
                          maxWidth: 236,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="col-span-1 flex-1 flex flex-col gap-1">
                <label className="font-bold text-gray-400">Valid Until</label>
                <DatePicker
                  label="Select Date"
                  onChange={(newValue) => onChange(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        width: "100%",
                        "@media (min-width: 1280px)": {
                          maxWidth: 236,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="col-span-1 xl:col-span-2">
                <div className="flex flex-col xl:flex-row gap-3 mt-5">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer flex-1 bg-gray-400 text-white font-medium rounded-md px-4 py-2 hover:opacity-90 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="cursor-pointer flex-1 bg-primaryYellow text-white font-medium rounded-md px-4 py-2 hover:opacity-90 text-sm"
                  >
                    {btnType.includes("Add")
                      ? "Add New Discount"
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isInfoModalOpen} style={modalStyle2}>
          <div className="flex flex-col gap-5 items-center justify-center p-6">
            <h1 className="text-primaryYellow font-bold text-xl">
              Price Per Tray
            </h1>
            <p className="font-semibold opacity-70 text-center">
              Price per Tray refers to the cost assigned to one standard tray of
              eggs {"(typically 30 pieces)."} It serves as the base unit for
              pricing in egg sales. This metric is commonly used in poultry
              trading because it standardizes egg pricing, making it simple to
              compare, track, and adjust prices across markets.
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
    </div>
  );
}
