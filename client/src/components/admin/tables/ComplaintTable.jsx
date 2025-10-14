//COMPLAINTS TABLE
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";
import Modal from "react-modal";
import eggImage from "../../../assets/egg.png";

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 20,
    maxHeight: "90vh",
    width: "60vw",
    overflow: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

// Style only for the Refund modal (card look)
const refundModalStyle = {
  content: {
    ...modalStyle.content,
    width: "720px",
    padding: 0,
    overflow: "auto", // allow scrolling so footer doesn't disappear
    borderRadius: 24,
  },
  overlay: modalStyle.overlay,
};

const rows = [
  {
    refundId: "RF-1001",
    customerName: "Maria Lopez",
    orderId: "ORD-001",
    reason: "Damaged eggs upon arrival",
    imageProof: eggImage,
    totalAmountPaid: 1200.0,
    quantityOrdered: 5,
    deliveryFee: 100,
    serviceFee: 20,
    modeOfPayment: "PayPal",
    gcashName: "Maria Lopez",
    gcashNumber: "09171234567",
    deliveryDate: "2025-10-02",
    dateSubmitted: "2025-10-03",
    status: "In Review",
    refundedOn: null,
    payoutInfoId: null,
  },
  {
    refundId: "RF-1002",
    customerName: "Justin Bieber",
    orderId: "ORD-002",
    reason: "Wrong size delivered",
    imageProof: "https://via.placeholder.com/120x80.png?text=Proof",
    totalAmountPaid: 950.0,
    quantityOrdered: 3,
    deliveryFee: 80,
    serviceFee: 15,
    modeOfPayment: "COD",
    gcashName: null,
    gcashNumber: null,
    deliveryDate: "2025-10-01",
    dateSubmitted: "2025-10-03",
    status: "Refunded",
    refundedOn: "2025-10-05",
    payoutInfoId: "PYT-9021",
  },
];

export default function ComplaintTable({ selectedOption }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Refund modal state
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundImageFile, setRefundImageFile] = useState(null);
  const [refundImagePreview, setRefundImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!selectedOption || selectedOption === "All") return rows;
    return rows.filter(
      (r) => r.status.toLowerCase() === selectedOption.toLowerCase()
    );
  }, [selectedOption]);

  useEffect(() => {
    setSelected(Array(filtered.length).fill(false));
    setSelectAll(false);
  }, [filtered.length]);

  const viewDetails = (item) => {
    setModalData(item);
    setIsModalOpen(true);
  };

  const headersInReview = [
    "Refund ID",
    "Customer Name",
    "Order ID",
    "Reason",
    "Date Submitted",
    "Status",
    "Action",
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filtered.length).fill(isChecked));
      }}
    />,
  ];

  const headersRefunded = [
    "Refund ID",
    "Customer Name",
    "Order ID",
    "Reason",
    "Refunded On",
    "Status",
    "Action",
    <input
      key="selectAll"
      type="checkbox"
      checked={selectAll}
      className="accent-primaryYellow focus:ring-2 focus:ring-black"
      onChange={(e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        setSelected(Array(filtered.length).fill(isChecked));
      }}
    />,
  ];

  const headers =
    selectedOption === "Refunded" ? headersRefunded : headersInReview;

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.every(Boolean));
  };

  // Selected rows
  const selectedItems = useMemo(
    () => filtered.filter((_, i) => selected[i]),
    [filtered, selected]
  );

  // Open refund modal from parent button
  useEffect(() => {
    const handler = () => {
      if (!selectedItems.length) {
        alert("Please select at least one complaint before refunding.");
        return;
      }
      setIsRefundOpen(true);
    };
    window.addEventListener("openRefundModal", handler);
    return () => window.removeEventListener("openRefundModal", handler);
  }, [selectedItems]);

  // File picker
  const onPickRefundImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRefundImageFile(file);
    const url = URL.createObjectURL(file);
    setRefundImagePreview(url);
  }, []);

  const clearRefundImage = useCallback(() => {
    setRefundImageFile(null);
    setRefundImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Confirm refund (stub only)
  const confirmRefund = useCallback(() => {
    console.log("Refunding items:", selectedItems.map((s) => s.refundId));
    console.log("Attached image file:", refundImageFile);
    setIsRefundOpen(false);
    clearRefundImage();
  }, [selectedItems, refundImageFile, clearRefundImage]);

  return (
    <>
      <Table headers={headers}>
        {filtered.map((item, index) => (
          <tr
            key={item.refundId}
            className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
          >
            <td className="px-4 py-3 text-center font-medium">{item.refundId}</td>
            <td className="px-4 py-3 text-center">{item.customerName}</td>
            <td className="px-4 py-3 text-center">{item.orderId}</td>
            <td className="px-4 py-3 text-center">{item.reason}</td>

            {selectedOption === "Refunded" ? (
              <td className="px-4 py-3 text-center">{item.refundedOn ?? "—"}</td>
            ) : (
              <td className="px-4 py-3 text-center">{item.dateSubmitted ?? "—"}</td>
            )}

            <td
              className={`px-4 py-3 text-center font-medium ${
                item.status === "In Review"
                  ? "text-gray-500"
                  : item.status === "Refunded"
                  ? "text-gray-500"
                  : "text-yellow-500"
              }`}
            >
              {item.status}
            </td>

            <td
              onClick={() => viewDetails(item)}
              className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
              title="View Details"
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

        {/* EXISTING: Details modal (unchanged) */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Refund Details"
          style={modalStyle}
        >
          {modalData && (
            <div className="flex flex-col gap-4 p-6">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-primaryYellow">Refund Details</h1>
                  <p className="text-lg text-gray-400 font-bold">
                    Refund ID: {modalData.refundId}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <h1 className="text-lg text-gray-400 font-bold">Current Status:</h1>
                  <p
                    className={`text-2xl font-bold ${
                      modalData.status === "In Review" ? "text-gray-500" : "text-primaryYellow"
                    }`}
                  >
                    {modalData.status}
                  </p>
                </div>
              </div>

              {/* Info section */}
              <div className="border-2 p-5 rounded-lg w-full flex gap-8 items-start">
                <div className="flex flex-col items-center w-1/2 -ml-8">
                  <p className="font-bold text-primaryYellow mb-2">Image Proof</p>
                  {modalData.imageProof ? (
                    <img
                      src={modalData.imageProof}
                      alt="Proof"
                      className="rounded-lg border"
                      style={{ width: 300, height: "auto" }}
                    />
                  ) : (
                    <p className="text-gray-500">No image provided</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-1/2 -ml-4">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold text-primaryYellow">Customer Name</p>
                      <p className="text-gray-500 font-bold">{modalData.customerName}</p>
                    </div>
                    <div>
                      <p className="font-bold text-primaryYellow">Order ID</p>
                      <p className="text-gray-500 font-bold">{modalData.orderId}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-primaryYellow">Reason</p>
                    <p className="text-gray-500 font-bold">{modalData.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold text-primaryYellow">Quantity Ordered</p>
                      <p className="text-gray-500 font-bold">
                        {modalData.quantityOrdered} trays
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-primaryYellow">Mode of Payment</p>
                      <p className="text-gray-500 font-bold">{modalData.modeOfPayment}</p>
                    </div>
                  </div>

                  {/* GCash Fields (used here for PayPal refund details) */}
                  {modalData.modeOfPayment === "PayPal" && (
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="font-bold text-primaryYellow">GCash Name</p>
                        <p className="text-gray-500 font-bold">{modalData.gcashName ?? "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-primaryYellow">GCash Number</p>
                        <p className="text-gray-500 font-bold">{modalData.gcashNumber ?? "N/A"}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t pt-4 mt-2">
                    <h2 className="font-bold text-primaryYellow mb-2">Order Summary</h2>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Subtotal</span>
                      <span>
                        ₱
                        {(
                          modalData.totalAmountPaid -
                          modalData.deliveryFee -
                          modalData.serviceFee
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Delivery Fee</span>
                      <span>₱{modalData.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Service Fee</span>
                      <span>₱{modalData.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 font-extrabold mt-2">
                      <span>Total Order</span>
                      <span>₱{modalData.totalAmountPaid.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-yellow-50 mt-4 rounded-md p-3">
                      <IoInformationCircleOutline className="text-gray-600 text-xl" />
                      <p className="text-gray-600 text-sm font-semibold">
                        Service fee is not included in refund amount.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer bg-primaryYellow text-white font-semibold text-lg rounded-lg px-6 py-2 mb-2"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* REFUND MODAL — simplified: upload + actions only */}
        <Modal
          isOpen={isRefundOpen}
          onRequestClose={() => setIsRefundOpen(false)}
          contentLabel="Process Refund"
          style={refundModalStyle}
        >
          {/* Header */}
          <div className="px-6 py-5" style={{ backgroundColor: "#fec718" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Process Refund</h1>
                <p className="text-sm text-gray-800/80 mt-1">Attach a single image as proof.</p>
              </div>
              <button
                onClick={() => setIsRefundOpen(false)}
                className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow"
              >
                X
              </button>
            </div> 
          </div>

          {/* Body: Upload only */}
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image Proof (required)
            </label>

            {/* Click-to-upload area: only triggers when no image yet */}
            <div
              onClick={() => {
                if (!refundImagePreview) fileInputRef.current?.click();
              }}
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6"
              style={
                refundImagePreview
                  ? { borderColor: "#86efac", backgroundColor: "#f0fdf4" }
                  : { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
              }
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">
                  {refundImagePreview ? "Image selected" : "Click to upload"}
                </div>
                <div className="text-xs text-gray-500 mt-1">JPG, PNG</div>
              </div>

              {/* Hidden input (no overlay) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickRefundImage}
                className="hidden"
                aria-label="Attach refund proof image"
              />

              {/* Preview */}
              {refundImagePreview && (
                <div className="mt-4 w-full">
                  <div className="rounded-xl border bg-white p-3 shadow-sm">
                    <img
                      src={refundImagePreview}
                      alt="Refund Proof Preview"
                      className="rounded-lg max-h-64 w-full object-contain"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        {refundImageFile?.name ?? "Selected Image"}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click(); // change image
                          }}
                          className="text-xs font-semibold text-gray-700"
                        >
                          Change image
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRefundImage();
                          }}
                          className="text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions — sticky so always visible */}
            <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4 px-0">
              <button
                onClick={() => {
                  setIsRefundOpen(false);
                  clearRefundImage();
                }}
                className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefund}
                disabled={!refundImageFile}
                className="px-5 py-2 rounded-xl text-white font-semibold shadow"
                style={{
                  backgroundColor: refundImageFile ? "#fec718" : "#fde68a",
                  cursor: refundImageFile ? "pointer" : "not-allowed",
                }}
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </Modal>
      </Table>
    </>
  );
}



// import React, { useState } from "react";
// import Table from "../../Table";
// import { FaCircleInfo } from "react-icons/fa6";
// import Modal from "react-modal";

// const modalStyle = {
//   content: {
//     top: "50%",
//     left: "50%",
//     right: "auto",
//     bottom: "auto",
//     transform: "translate(-50%, -50%)",
//     borderRadius: 20,
//     padding: 10,
//     maxHeight: "100vh",
//     width: "50vw",
//     overflow: "visible",
//   },
//   overlay: {
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     zIndex: 1000,
//   },
// };

// const complaints = [
//   {
//     orderID: "001",
//     complainant: "Maria Lopez",
//     against: "Juan Dela Cruz",
//     phoneNumber: "09421323232",
//     type: `Product Quality`,
//     message: `The eggs were damaged`,
//     paymentMethod: "Paypal",
//     status: `In Review`,
//     address: "Z2-089 Tiago Lasang Tanaok City Cebu",
//   },
//   {
//     orderID: "002",
//     complainant: "Justin Bieber",
//     against: "Juan Dela Cruz",
//     type: `Product Quality`,
//     phoneNumber: "09421323232",
//     message: `The eggs were damaged`,
//     paymentMethod: "Paypal",
//     status: `Resolved`,
//     address: "Z2-089 Tiago Lasang Tanaok City Cebu",
//   },
//   {
//     orderID: "003",
//     complainant: "Maria Lopez",
//     against: "Juan Dela Cruz",
//     type: `Product Quality`,
//     phoneNumber: "09421323232",
//     message: `The eggs were damaged`,
//     paymentMethod: "Paypal",
//     status: `In Review`,
//     address: "Z2-089 Tiago Lasang Tanaok City Cebu",
//   },
//   {
//     orderID: "004",
//     complainant: "Maria Lopez",
//     against: "Juan Dela Cruz",
//     type: `Product Quality`,
//     phoneNumber: "09421323232",
//     message: `The eggs were damaged`,
//     paymentMethod: "Paypal",
//     status: `Resolved`,
//     address: "Z2-089 Tiago Lasang Tanaok City Cebu",
//   },
//   {
//     orderID: "005",
//     complainant: "Maria Lopez",
//     against: "Juan Dela Cruz",
//     type: `Product Quality`,
//     phoneNumber: "09421323232",
//     message: `The eggs were damaged`,
//     paymentMethod: "Paypal",
//     status: `Refunded`,
//     address: "Z2-089 Tiago Lasang Tanaok City Cebu",
//   },
// ];

// export default function ComplaintTable({ selectedOption }) {
//   const [selected, setSelected] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalData, setModalData] = useState();

//   const filteredComplaints =
//     selectedOption && selectedOption !== "All"
//       ? complaints.filter(
//           (c) => c.status.toLowerCase() === selectedOption.toLowerCase()
//         )
//       : complaints;

//   const viewOrderDetails = (item) => {
//     setIsModalOpen(!isModalOpen);
//     if (item) setModalData(item);
//   };

//   const headers = [
//     "Order ID",
//     "Complainant",
//     "Complaint Against",
//     "Type",
//     "Status",
//     "View Details",
//     <input
//       key="selectAll"
//       type="checkbox"
//       checked={selectAll}
//       className="accent-primaryYellow focus:ring-2 focus:ring-black"
//       onChange={(e) => {
//         const isChecked = e.target.checked;
//         setSelectAll(isChecked);
//         setSelected(Array(filteredComplaints.length).fill(isChecked));
//       }}
//     />,
//   ];

//   const handleCheckboxChange = (index) => {
//     const updated = [...selected];
//     updated[index] = !updated[index];
//     setSelected(updated);

//     setSelectAll(updated.every(Boolean));
//   };

//   return (
//     <Table headers={headers}>
//       {filteredComplaints.map((item, index) => (
//         <tr
//           key={index}
//           className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
//         >
//           <td className="px-4 py-3 text-center font-medium">{item.orderID}</td>
//           <td className="px-4 py-3 text-center">{item.complainant}</td>
//           <td className="px-4 py-3 text-center">{item.against}</td>
//           <td className="px-4 py-3 text-center">{item.type}</td>
//           <td
//             className={`px-4 py-3 text-center font-medium
//               ${item.status === "Resolved" ? "text-green-600" : ""}
//               ${item.status === "In Review" ? "text-yellow-500" : ""}
//               ${item.status === "Refunded" ? "text-red-500" : ""}`}
//           >
//             {item.status}
//           </td>
//           <td onClick={() => viewOrderDetails(item)} className=" cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400">
//             <FaCircleInfo />
//           </td>
//           <td className="px-4 py-3 text-center">
//             <input
//               type="checkbox"
//               className="accent-primaryYellow focus:ring-2 focus:ring-black"
//               checked={selected[index] || false}
//               onChange={() => handleCheckboxChange(index)}
//             />
//           </td>
//         </tr>
//       ))}
//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={() => {
//           setIsModalOpen(!isModalOpen);
//         }}
//         contentLabel="Order Details"
//         style={modalStyle}
//       >
//         {modalData && (
//           <div className="flex flex-col gap-5 p-10">
//             <div className="flex flex-row items-center justify-between">
//               <div className="flex flex-col leading-tight">
//                 <h1 className="text-2xl font-bold text-primaryYellow">
//                   Complaint Details
//                 </h1>
//                 <p className="text-lg text-gray-400 font-bold">
//                   Order #: {modalData.orderID}
//                 </p>
//               </div>
//               <div className="flex flex-col leading-tight items-end">
//                 <h1 className="text-lg text-gray-400 font-bold">
//                   Current Status:
//                 </h1>
//                 <p className="text-2xl font-bold text-primaryYellow">
//                   {modalData.status}
//                 </p>
//               </div>
//             </div>
//             <div className="flex flex-col leading-tight">
//               <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
//                 {modalData.complainant}{" "}
//                 <span className="text-gray-400">{modalData.phoneNumber}</span>{" "}
//               </h1>
//               <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">
//                 {modalData.address}
//               </h2>
//               <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">
//                 Payment Method: {modalData.paymentMethod}
//               </h2>
//             </div>
//             <div className="flex flex-row gap-5">
//               {/* Item summary */}
//               <div className="border-2 p-5 rounded-lg w-full flex flex-col justify-center gap-15">
//                 <div className="flex flex-col gap-3">
//                     <div className="flex flex-col leading-tight">
//                       <p className="font-bold text-gray-400">Complaint Type:</p>
//                       <p className="text-primaryYellow text-lg font-bold">{modalData.type}</p>
//                     </div>
//                 </div>
//                 <div className="flex flex-col gap-3">
//                     <div className="flex flex-col leading-tight">
//                       <p className="font-bold text-gray-400">Message:</p>
//                       <p className="text-primaryYellow text-lg font-bold">{modalData.message}</p>
//                     </div>
//                 </div>
//               </div>
//               {/* Order Summary */}
//               <div className="border-2 p-5 rounded-lg w-full">
//                 <div className="flex flex-col gap-1">
//                   <h1 className="text-xl text-primaryYellow font-bold mb-3">
//                     Order Summary
//                   </h1>
//                   <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
//                     <p>Subtotal</p>
//                     <p>₱808.00</p>
//                   </div>
//                   <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
//                     <p>Delivery Fee</p>
//                     <p>₱808.00</p>
//                   </div>
//                   <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
//                     <p>Shipping Discount</p>
//                     <p>₱808.00</p>
//                   </div>
//                   <div className="flex flex-row justify-between items-center text-gray-400 font-bold text-lg">
//                     <p>Product Discount</p>
//                     <p>₱808.00</p>
//                   </div>
//                   <div className="flex flex-row justify-between items-center font-bold text-lg">
//                     <p>Total Order</p>
//                     <p>₱808.00</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center justify-center">
//               <button
//                 onClick={() => setIsModalOpen(!isModalOpen)}
//                 className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-30 py-3"
//               >
//                 Back
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </Table>
//   );
// }
