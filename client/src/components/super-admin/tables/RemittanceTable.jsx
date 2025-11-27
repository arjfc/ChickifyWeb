import React, { useState, useEffect } from "react";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
import Modal from "react-modal";
import { fetchAllRemittances } from "@/services/Remittance";

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

const peso = (n) =>
  typeof n === "number"
    ? `₱${n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "₱0.00";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-PH") : "";

export default function ProofTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proofSrc, setProofSrc] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⬅️ Added "Coop Name"
  const headers = ["Coop Name", "Date", "Amount", "Memo", "View Proof"];

  const openProof = (src) => {
    setProofSrc(src || "");
    setIsModalOpen(true);
  };

  const closeProof = () => {
    setIsModalOpen(false);
    setProofSrc("");
  };

  useEffect(() => {
    const loadRemittances = async () => {
      try {
        const data = await fetchAllRemittances();
        setRows(data || []);
      } catch (err) {
        console.error("[ProofTable] Failed to load remittances:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRemittances();
  }, []);

  return (
    <>
      <Table headers={headers}>
        {loading ? (
          <tr>
            <td
              className="px-4 py-3 text-center text-gray-500"
              colSpan={headers.length}
            >
              Loading remittances…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td
              className="px-4 py-3 text-center text-gray-500"
              colSpan={headers.length}
            >
              No remittances found.
            </td>
          </tr>
        ) : (
          rows.map((item) => (
            <tr
              key={item.ledger_id}
              className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
            >
              {/* COOP NAME */}
              <td className="px-4 py-3 text-center font-medium">
                {item.coop_name || "—"}
              </td>

              {/* DATE */}
              <td className="px-4 py-3 text-center">
                {formatDate(item.created_at)}
              </td>

              {/* AMOUNT */}
              <td className="px-4 py-3 text-center font-semibold">
                {peso(item.amount)}
              </td>

              {/* MEMO */}
              <td className="px-4 py-3 text-center">
                {item.memo || "—"}
              </td>

              {/* VIEW PROOF */}
              <td
                onClick={() => openProof(item.img)}
                className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400 hover:text-gray-600"
                title="View Proof"
              >
                <FaCircleInfo />
              </td>
            </tr>
          ))
        )}
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
