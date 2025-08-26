import React, { useState } from "react";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
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

const complaints = [
  {
    orderID: "001",
    complainant: "Maria Lopez",
    against: "Juan Dela Cruz",
    phoneNumber: "09421323232",
    type: `Product Quality`,
    message: `The eggs were damaged`,
    paymentMethod: "Paypal",
    status: `In Review`,
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "002",
    complainant: "Justin Bieber",
    against: "Juan Dela Cruz",
    type: `Product Quality`,
    phoneNumber: "09421323232",
    message: `The eggs were damaged`,
    paymentMethod: "Paypal",
    status: `Resolved`,
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "003",
    complainant: "Maria Lopez",
    against: "Juan Dela Cruz",
    type: `Product Quality`,
    phoneNumber: "09421323232",
    message: `The eggs were damaged`,
    paymentMethod: "Paypal",
    status: `In Review`,
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "004",
    complainant: "Maria Lopez",
    against: "Juan Dela Cruz",
    type: `Product Quality`,
    phoneNumber: "09421323232",
    message: `The eggs were damaged`,
    paymentMethod: "Paypal",
    status: `Resolved`,
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "005",
    complainant: "Maria Lopez",
    against: "Juan Dela Cruz",
    type: `Product Quality`,
    phoneNumber: "09421323232",
    message: `The eggs were damaged`,
    paymentMethod: "Paypal",
    status: `Refunded`,
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
];

export default function ComplaintTable({ selectedOption }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState();

  const filteredComplaints =
    selectedOption && selectedOption !== "All"
      ? complaints.filter(
          (c) => c.status.toLowerCase() === selectedOption.toLowerCase()
        )
      : complaints;

  const viewOrderDetails = (item) => {
    setIsModalOpen(!isModalOpen);
    if (item) setModalData(item);
  };

  const headers = [
    "Order ID",
    "Complainant",
    "Complaint Against",
    "Type",
    "Status",
    "View Details",
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filteredComplaints.length).fill(isChecked));
      }}
    />,
  ];

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };

  return (
    <Table headers={headers}>
      {filteredComplaints.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
        >
          <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
          <td className="px-4 py-3 text-center">{item.complainant}</td>
          <td className="px-4 py-3 text-center">{item.against}</td>
          <td className="px-4 py-3 text-center">{item.type}</td>
          <td
            className={`px-4 py-3 text-center font-medium
              ${item.status === "Resolved" ? "text-green-600" : ""}
              ${item.status === "In Review" ? "text-yellow-500" : ""}
              ${item.status === "Refunded" ? "text-red-500" : ""}`}
          >
            {item.status}
          </td>
          <td onClick={() => viewOrderDetails(item)} className=" cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400">
            <FaCircleInfo />
          </td>
          <td className="px-4 py-3 text-center">
            <input
              type="checkbox"
              className="accent-primaryYellow focus:ring-2 focus:ring-black"
              checked={selected[index] || false}
              onChange={() => handleCheckboxChange(index)}
            />
          </td>
        </tr>
      ))}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(!isModalOpen);
        }}
        contentLabel="Order Details"
        style={modalStyle}
      >
        {modalData && (
          <div className="flex flex-col gap-5 p-10">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col leading-tight">
                <h1 className="text-2xl font-bold text-primaryYellow">
                  Complaint Details
                </h1>
                <p className="text-lg text-gray-400 font-bold">
                  Order #: {modalData.orderID}
                </p>
              </div>
              <div className="flex flex-col leading-tight items-end">
                <h1 className="text-lg text-gray-400 font-bold">
                  Current Status:
                </h1>
                <p className="text-2xl font-bold text-primaryYellow">
                  {modalData.status}
                </p>
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                {modalData.complainant}{" "}
                <span className="text-gray-400">{modalData.phoneNumber}</span>{" "}
              </h1>
              <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                {modalData.address}
              </h2>
              <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                Payment Method: {modalData.paymentMethod}
              </h2>
            </div>
            <div className="flex flex-row gap-5">
              {/* Item summary */}
              <div className="border-2 p-5 rounded-lg w-full flex flex-col justify-center gap-15">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col leading-tight">
                      <p className="font-bold text-gray-400">Complaint Type:</p>
                      <p className="text-primaryYellow text-lg font-bold">{modalData.type}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col leading-tight">
                      <p className="font-bold text-gray-400">Message:</p>
                      <p className="text-primaryYellow text-lg font-bold">{modalData.message}</p>
                    </div>
                </div>
              </div>
              {/* Order Summary */}
              <div className="border-2 p-5 rounded-lg w-full">
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl text-primaryYellow font-bold mb-3">
                    Order Summary
                  </h1>
                  <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
                    <p>Subtotal</p>
                    <p>₱808.00</p>
                  </div>
                  <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
                    <p>Delivery Fee</p>
                    <p>₱808.00</p>
                  </div>
                  <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
                    <p>Shipping Discount</p>
                    <p>₱808.00</p>
                  </div>
                  <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
                    <p>Product Discount</p>
                    <p>₱808.00</p>
                  </div>
                  <div className="flex flex-row justify-between items-center font-bold text-lg">
                    <p>Total Order</p>
                    <p>₱808.00</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Table>
  );
}
