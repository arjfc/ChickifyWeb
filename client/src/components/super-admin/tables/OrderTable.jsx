import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
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

  const adminVer = [
    {
      orderID: "001",
      customerName: "Maria Lopez",
      phoneNumber: "094212323232",
      address: "Z2-089 Tiago Lasang Tanaok City Cebu",
      dateOrdered: "10/02/2025",
      totalAmount: `520`,
      orderStatus: `pending`,
      paymentStatus: `paid`,
    },
    {
      orderID: "001",
      customerName: "Maria Lopez",
      dateOrdered: "10/02/2025",
      totalAmount: `520`,
      orderStatus: `pending`,
      paymentStatus: `paid`,
    },
    {
      orderID: "001",
      customerName: "Maria Lopez",
      dateOrdered: "10/02/2025",
      totalAmount: `520`,
      orderStatus: `pending`,
      paymentStatus: `paid`,
    },
    {
      orderID: "001",
      customerName: "Maria Lopez",
      dateOrdered: "10/02/2025",
      totalAmount: `520`,
      orderStatus: `rejected`,
      paymentStatus: `paid`,
    },
    {
      orderID: "001",
      customerName: "Maria Lopez",
      dateOrdered: "10/02/2025",
      totalAmount: `520`,
      orderStatus: `approved`,
      paymentStatus: `paid`,
    },
    {
      orderID: "001",
      customerName: "Maria Lopez",
      dateOrdered: "10/02/2025",
      totalAmount: `520`,
      orderStatus: `rejected`,
      paymentStatus: `paid`,
    },
  ];

export default function OrderTable({ selectedOption }) {
const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState();

  const headers = [
    "Order ID",
    "Customer",
    "Date Ordered",
    "Total Amount",
    "Order Status",
    "Payment Status",
    "Details",
  ];

  const filteredOrders =
    selectedOption && selectedOption !== "All"
      ? adminVer.filter(
          (order) =>
            order.orderStatus.toLowerCase() === selectedOption.toLowerCase()
        )
      : adminVer;

  const statusColors = {
    pending: "text-yellow-500",
    approved: "text-green-600",
    rejected: "text-red-600",
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
            className={`px-4 py-3 text-center font-medium capitalize ${
              statusColors[item.orderStatus] || "text-gray-500"
            }`}
          >
            {item.orderStatus}
          </td>
          <td className="px-4 py-3 text-center capitalize">
            {item.paymentStatus}
          </td>
          <td onClick={() => viewOrderDetails(item)} className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400">
            <FaCircleInfo />
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
                <p className="text-2xl font-bold text-primaryYellow capitalize">
                  {modalData.orderStatus}
                </p>
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                {modalData.customerName}{" "}
                <span className="text-gray-400">{modalData.phoneNumber}</span>{" "}
              </h1>
              <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                {modalData.address}
              </h2>
            </div>
            <div className="flex flex-row gap-5">
              {/* Item summary */}
              <div className="border-2 p-5 rounded-lg w-full">
                <div className="flex flex-col gap-3">
                  <h1 className="text-xl text-primaryYellow font-bold mb-5">
                    Item Summary
                  </h1>
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
                  <h1 className="text-xl text-primaryYellow font-bold mb-5">
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
                  <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
                    <p>Payment Method</p>
                    <p>COD</p>
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
