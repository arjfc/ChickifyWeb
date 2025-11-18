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
    borderRadius: 16,
    padding: 12,
    maxHeight: "85vh",
    width: "min(90vw, 480px)", // ⬅️ smaller and responsive
    overflow: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
  },
};

// 🔹 Sample data (replace with your real data)
const rows = [
  {
    name: "Maria Lopez",
    date: "10/02/2025",
    amount: 520,
    proofUrl:
      "https://images.unsplash.com/photo-1516570161787-2fd917215a3d?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Juan Dela Cruz",
    date: "10/05/2025",
    amount: 1300,
    proofUrl:
      "https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Ana Santos",
    date: "10/08/2025",
    amount: 260,
    proofUrl:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1600&auto=format&fit=crop",
  },
];

const peso = (n) =>
  typeof n === "number"
    ? `₱${n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₱0.00";

export default function ProofTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proofSrc, setProofSrc] = useState("");

  const headers = ["Name", "Date", "Amount", "View Proof"];

  const openProof = (src) => {
    setProofSrc(src || "");
    setIsModalOpen(true);
  };

  const closeProof = () => {
    setIsModalOpen(false);
    setProofSrc("");
  };

  return (
    <>
      <Table headers={headers}>
        {rows.map((item, idx) => (
          <tr
            key={idx}
            className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
          >
            <td className="px-4 py-3 text-center font-medium">{item.name}</td>
            <td className="px-4 py-3 text-center">{item.date}</td>
            <td className="px-4 py-3 text-center font-semibold">
              {peso(item.amount)}
            </td>
            <td
              onClick={() => openProof(item.proofUrl)}
              className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400 hover:text-gray-600"
              title="View Proof"
            >
              <FaCircleInfo />
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeProof}
        contentLabel="Proof of Payment"
        style={modalStyle}
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primaryYellow">
              Proof of Payment
            </h2>
            <button
              onClick={closeProof}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          <div className="mt-1">
            {proofSrc ? (
              <img
                src={proofSrc}
                alt="Payment proof"
                className="w-full max-h-[50vh] rounded-lg border object-contain"
              />
            ) : (
              <div className="w-full h-48 grid place-items-center rounded-lg border bg-gray-50 text-gray-400">
                No image available
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
