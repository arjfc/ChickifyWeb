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

const orderStatus = [
  {
    orderID: "001",
    customerName: "Maria Lopez",
    dateOrdered: "10/02/2025",
    totalAmount: `520`,
    orderStatus: `Pending`,
    paymentStatus: `Paid`,
    phoneNumber: "09421323232",
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "001",
    customerName: "Maria Lopez",
    dateOrdered: "10/02/2025",
    totalAmount: `520`,
    orderStatus: `Pending`,
    paymentStatus: `Paid`,
    phoneNumber: "09421323232",
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "002",
    customerName: "Juan Dela Cruz",
    dateOrdered: "11/02/2025",
    totalAmount: `220`,
    orderStatus: `Completed`,
    paymentStatus: `Paid`,
    phoneNumber: "09421323232",
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "003",
    customerName: "Anna Santos",
    dateOrdered: "12/02/2025",
    totalAmount: `150`,
    orderStatus: `Canceled`,
    paymentStatus: `Unpaid`,
    phoneNumber: "09421323232",
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
  {
    orderID: "004",
    customerName: "Pedro Reyes",
    dateOrdered: "13/02/2025",
    totalAmount: `310`,
    orderStatus: "Refunded",
    paymentStatus: `Refunded`,
    phoneNumber: "09421323232",
    address: "Z2-089 Tiago Lasang Tanaok City Cebu",
  },
];

export default function OrderTable({ selectedOption }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState();
  const filteredOrders =
    selectedOption && selectedOption !== "All"
      ? orderStatus.filter((order) => order.orderStatus === selectedOption)
      : orderStatus;

  const headers = [
    "Order ID",
    "Customer",
    "Date Ordered",
    "Total Amount",
    "Order Status",
    "Payment Status",
    "Details",
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filteredOrders.length).fill(isChecked));
      }}
    />,
  ];

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);

    setSelectAll(updated.every(Boolean));
  };

  const statusColors = {
    Pending: "text-yellow-500",
    Completed: "text-green-600",
    Canceled: "text-red-600",
    Refunded: "text-orange-500",
  };

  const viewOrderDetails = (item) => {
    setIsModalOpen(!isModalOpen);
    if (item) setModalData(item);
  };

  return (
    <Table headers={headers}>
      {filteredOrders.map((item, index) => (
        <tr
          key={index}
          className="bg-yellow-100  text-gray-700 rounded-lg shadow-sm  transition"
        >
          <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
          <td className="px-4 py-3 text-center">{item.customerName}</td>
          <td className="px-4 py-3 text-center">{item.dateOrdered}</td>
          <td className="px-4 py-3 text-center">{item.totalAmount}</td>
          <td
            className={`px-4 py-3 text-center font-medium ${
              statusColors[item.orderStatus] || "text-gray-500"
            }`}
          >
            {item.orderStatus}
          </td>
          <td className="px-4 py-3 text-center">{item.paymentStatus}</td>
          <td
            onClick={() => viewOrderDetails(item)}
            className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
          >
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
        {modalData && 
          <div className="flex flex-col gap-5 p-10">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col leading-tight">
                <h1 className="text-2xl font-bold text-primaryYellow">
                  Order Details
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
                  {modalData.orderStatus}
                </p>
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                {modalData.customerName} <span className="text-gray-400">{modalData.phoneNumber}</span>{" "}
              </h1>
              <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">{modalData.address}</h2>
            </div>
            <div className="flex flex-row gap-5">
              {/* Item summary */}
              <div className="border-2 p-5 rounded-lg w-full">
                <div className="flex flex-col gap-3">
                  <h1 className="text-xl text-primaryYellow font-bold mb-5">Item Summary</h1>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col leading-tight">
                        <p>5-Tray Bundle x2</p>
                        <p>Medium</p>
                    </div>
                    <p>₱808.00</p>
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col leading-tight">
                        <p>5-Tray Bundle x2</p>
                        <p>Medium</p>
                    </div>
                    <p>₱808.00</p>
                  </div>
                  <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-col leading-tight">
                        <p>5-Tray Bundle x2</p>
                        <p>Medium</p>
                    </div>
                    <p>₱808.00</p>
                  </div>
                </div>
              </div>
              {/* Order Summary */}
              <div className="border-2 p-5 rounded-lg w-full">
                <div className="flex flex-col gap-2">
                  <h1 className="text-xl text-primaryYellow font-bold mb-5">Order Summary</h1>
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
                  <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
                    <p>Payment Method</p>
                    <p>COD</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button onClick={() => setIsModalOpen(!isModalOpen)} className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3">
                Back
              </button>
            </div>
          </div>
        }
      </Modal>
    </Table>
  );
}
