// COMPLAINTS TABLE
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";
import Modal from "react-modal";
import eggImage from "../../../assets/egg.png";
import { viewRefundOverviewAdmin, approveRefundAdmin } from "@/services/Refund";
import { supabase } from "@/lib/supabase";

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

// ---------- Upload helper (your code, JS) ----------
const guessTypeFromName = (name) => {
  if (!name) return "image/jpeg";
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
};

/**
 * Upload an image (by URI) to Supabase Storage and return its public URL.
 * @param {number} id
 * @param {{ uri: string, type?: string|null, fileName?: string|null }} img
 * @param {string} [bucketName="refund-proofs"]
 * @param {string} [folder="refunds"]
 * @returns {Promise<string>} public URL
 */
async function uploadImageFromUrl(
  id,
  img,
  bucketName = "refund-proofs",
  folder = "refunds"
) {
  const fileName = img.fileName ?? `proof_${Date.now()}.jpg`;
  const path = `${folder}/${id}/${fileName}`;

  const res = await fetch(img.uri);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  const bytes = await res.arrayBuffer();

  const headerType = res.headers.get("content-type") || undefined;
  const contentType = img.type || headerType || guessTypeFromName(fileName);

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(path, bytes, { contentType, upsert: true });

  if (uploadError) throw uploadError;

  const { data, error: urlError } = supabase.storage.from(bucketName).getPublicUrl(path);
  if (urlError || !data?.publicUrl) throw urlError ?? new Error("No public URL returned");

  return data.publicUrl;
}

// PH-friendly date (no time)
const parseAsLocalDate = (s) => {
  if (typeof s !== "string") return null;
  const onlyDate = /^\d{4}-\d{2}-\d{2}$/;
  if (onlyDate.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0); // local
  }
  const dt = new Date(s);
  return isNaN(dt) ? null : dt;
};

const fmtPHDate = (v) => {
  if (!v) return "—";
  const dt = typeof v === "string" ? (parseAsLocalDate(v) || new Date(v)) : new Date(v);
  if (!dt || isNaN(dt)) return "—";
  return dt.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

// Style only for the Refund modal (card look)
const refundModalStyle = {
  content: {
    ...modalStyle.content,
    width: "720px",
    padding: 0,
    overflow: "auto",
    borderRadius: 24,
  },
  overlay: modalStyle.overlay,
};

/* ===== COPIED BACKEND DATE-RANGE LOGIC (from your FIRST CODE) ===== */
function computeRange(key) {
  const startToday = dayjs().startOf("day");
  switch (key) {
    case "today":
      return { start: startToday.toISOString(), end: startToday.add(1, "day").toISOString() };
    case "yesterday":
      return { start: startToday.subtract(1, "day").toISOString(), end: startToday.toISOString() };
    case "7":
      return { start: startToday.subtract(7, "day").toISOString(), end: null };
    case "30":
      return { start: startToday.subtract(30, "day").toISOString(), end: null };
    case "this_month":
      return {
        start: dayjs().startOf("month").toISOString(),
        end: dayjs().endOf("month").add(1, "millisecond").toISOString(),
      };
    case "last_month":
      return {
        start: dayjs().subtract(1, "month").startOf("month").toISOString(),
        end: dayjs().subtract(1, "month").endOf("month").add(1, "millisecond").toISOString(),
      };
    case "all":
    default:
      if (typeof key === "string" && key.includes("T")) return { start: key, end: null };
      return { start: null, end: null };
  }
}
/* ================================================================ */

export default function ComplaintTable({ selectedOption, date = "all" }) {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Refund modal state
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundImageFile, setRefundImageFile] = useState(null);
  const [refundImagePreview, setRefundImagePreview] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef(null);

  // 🔹 Reject modal (UI-only)
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // 🔄 Data from RPC
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map RPC row → UI shape
  const mapRpcToUi = (r) => {
    const d = r.details || {};
    const os = d.order_summary || {};
    return {
      refundId: r.refund_id,
      customerName: r.customer_name ?? "—",
      orderId: r.order_id,

      // For Pending/Approved we keep original reason
      reason: r.reason ?? "—",

      // 👇 NEW: reason for rejected
      reasonRejected: r.reason_rejected ?? d.reason_rejected ?? null,

      // raw ISO dates for backend filtering (unformatted)
      dateSubmittedISO: r.date_submitted ?? null,
      refundedOnISO: r.resolved_at ?? d.resolved_at ?? null,
      rejectedAtISO: r.rejected_at ?? d.rejected_at ?? null,

      // formatted dates for display
      dateSubmitted: fmtPHDate(r.date_submitted),
      status: r.status ?? "—",
      rejectedAt: fmtPHDate(r.rejected_at ?? d.rejected_at ?? null),
      refundedOn: fmtPHDate(r.resolved_at ?? d.resolved_at ?? null),

      // Prefer direct proof_image_url if your view projects it, else details.image_proof_url
      imageProof: r.proof_image_url ?? d.image_proof_url ?? null,

      totalAmountPaid: Number(os.total_order ?? 0),
      quantityOrdered: Number(d.quantity_ordered_trays ?? 0),
      deliveryFee: Number(os.delivery_fee ?? 0),
      serviceFee: Number(os.service_fee ?? 0),
      modeOfPayment: d.mode_of_payment ?? "—",
      gcashName: d.gcash_name ?? null,
      gcashNumber: d.gcash_number ?? null,
      payoutInfoId: d.payout_info_id ?? null,

      // 👇 NEW: refunded amount coming from your RPC/view (details or top-level)
      refundedAmount:
        r.refunded_amount != null
          ? Number(r.refunded_amount)
          : d.refunded_amount != null
          ? Number(d.refunded_amount)
          : null,
    };
  };

  // Fetch data on mount + when selectedOption changes
  const reload = useCallback(async () => {
    const pStatus =
      selectedOption && selectedOption.toLowerCase() !== "all"
        ? selectedOption
        : null;

    const data = await viewRefundOverviewAdmin({ status: pStatus });
    setRows((data || []).map(mapRpcToUi));
    setSelected(Array((data || []).length).fill(false));
    setSelectAll(false);
  }, [selectedOption]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await reload();
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load refunds");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Tabs
  const isPendingTab =
    (selectedOption || "").toLowerCase() === "pending" ||
    (selectedOption || "").toLowerCase() === "in review";
  const isApprovedTab = (selectedOption || "").toLowerCase() === "approved";
  const isRefundedTab = (selectedOption || "").toLowerCase() === "refunded";
  const isRejectedTab = (selectedOption || "").toLowerCase() === "rejected"; // 👈 NEW

  // headers
  const headersWithSubmitted = [
    "Refund ID",
    "Customer Name",
    "Order ID",
    "Reason",
    "Date Submitted",
    "Status",
    "Action",
  ];

  const headersWithRefundedOn = [
    "Refund ID",
    "Customer Name",
    "Order ID",
    "Reason",
    "Refunded On",
    "Status",
    "Action",
  ];

  const headersWithRejectedAt = [
    "Refund ID",
    "Customer Name",
    "Order ID",
    "Reason",
    "Rejected At",
    "Status",
    "Action",
  ];

  const headers =
    isApprovedTab || isRefundedTab
      ? headersWithRefundedOn
      : isRejectedTab
      ? headersWithRejectedAt
      : headersWithSubmitted;

  const handleCheckboxChange = (index) => {
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.every(Boolean));
  };

  // base status filter (unchanged)
  const baseFiltered = useMemo(() => {
    if (!selectedOption || selectedOption === "All") return rows;
    return rows.filter(
      (r) => (r.status || "").toLowerCase() === selectedOption.toLowerCase()
    );
  }, [rows, selectedOption]);

  // ===== DATE FILTER (uses computeRange from FIRST CODE) =====
  const dateFiltered = useMemo(() => {
    const { start, end } = computeRange(date);
    if (!start && !end) return baseFiltered;

    const startTs = start ? new Date(start).getTime() : null;
    const endTs = end ? new Date(end).getTime() : null;

    // pick which date column to use based on tab
    const pickISO = (r) => {
      if (isApprovedTab || isRefundedTab) return r.refundedOnISO;
      if (isRejectedTab) return r.rejectedAtISO;
      return r.dateSubmittedISO;
    };

    return baseFiltered.filter((r) => {
      const iso = pickISO(r);
      if (!iso) return false;
      const t = new Date(iso).getTime();
      if (isNaN(t)) return false;
      if (startTs && t < startTs) return false;
      if (endTs && t >= endTs) return false;
      return true;
    });
  }, [baseFiltered, date, isApprovedTab, isRefundedTab, isRejectedTab]);

  useEffect(() => {
    setSelected(Array(dateFiltered.length).fill(false));
    setSelectAll(false);
  }, [dateFiltered.length]);

  const selectedItems = useMemo(
    () => dateFiltered.filter((_, i) => selected[i]),
    [dateFiltered, selected]
  );

  const showSelectionColumn = isPendingTab;

  const viewDetails = (item) => {
    setModalData(item);
    setIsModalOpen(true);
  };

  // ---- Refund modal handlers ----
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

  const confirmRefund = useCallback(async () => {
    if (!refundImageFile || !refundImagePreview) return;

    const amountNum = parseFloat(refundAmount || "0");
    if (!(amountNum > 0)) return;

    // Process selected items or the currently viewed item
    const items = selectedItems.length ? selectedItems : (modalData ? [modalData] : []);

    setIsConfirming(true);
    try {
      for (const item of items) {
        // 1) Upload to Storage
        const publicUrl = await uploadImageFromUrl(item.refundId, {
          uri: refundImagePreview,                 // blob URL from preview
          type: refundImageFile?.type ?? null,
          fileName: refundImageFile?.name ?? null,
        });

        // 2) Call approve_refund RPC
        await approveRefundAdmin({
          refundId: item.refundId,
          proofImgUrl: publicUrl,                  // saved to refund_req.proof_img_url
          gcashName: item.gcashName ?? null,       // optional (server upserts if present)
          gcashNumber: item.gcashNumber ?? null,   // optional
          amount: amountNum,                       // or null to let server resolve
        });
      }

      // 3) Reset UI + reload list
      setIsRefundOpen(false);
      clearRefundImage();
      setRefundAmount("");
      await reload();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to approve refund.");
    } finally {
      setIsConfirming(false);
    }
  }, [
    refundImageFile,
    refundImagePreview,
    refundAmount,
    selectedItems,
    modalData,
    clearRefundImage,
    reload,
  ]);

  const canConfirmRefund =
    !!refundImageFile && !!refundAmount && parseFloat(refundAmount) > 0 && !isConfirming;

  // ===== Listen for Approve/Reject triggers BUT ONLY OPEN IF A CHECKBOX IS SELECTED =====
  useEffect(() => {
    const handleOpenRefund = () => {
      if (selectedItems.length === 0) return; // ❗ Guard: require at least one checkbox
      setIsRefundOpen(true);
    };
    const handleOpenReject = () => {
      if (selectedItems.length === 0) return; // ❗ Guard: require at least one checkbox
      setIsRejectOpen(true);
    };

    window.addEventListener("openRefundModal", handleOpenRefund);
    window.addEventListener("openRejectModal", handleOpenReject);
    return () => {
      window.removeEventListener("openRefundModal", handleOpenRefund);
      window.removeEventListener("openRejectModal", handleOpenReject);
    };
  }, [selectedItems.length]); // rebind when selection changes

  // ========== Reject modal handlers (UI-only; NO RPC) ==========
  const confirmReject = useCallback(async () => {
    const reason = (rejectReason || "").trim();
    if (!reason) return;

    setIsRejecting(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      setIsRejectOpen(false);
      setRejectReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsRejecting(false);
    }
  }, [rejectReason]);

  const canConfirmReject = !!(rejectReason && rejectReason.trim().length > 0) && !isRejecting;

  return (
    <>
      <Table headers={showSelectionColumn ? [...headers, ""] : headers}>
        {dateFiltered.map((item, index) => (
          <tr
            key={item.refundId}
            className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
          >
            <td className="px-4 py-3 text-center font-medium">{item.refundId}</td>
            <td className="px-4 py-3 text-center">{item.customerName}</td>
            <td className="px-4 py-3 text-center">{item.orderId}</td>

            {/* 👇 For Rejected tab, show reason_rejected; else show reason */}
            <td className="px-4 py-3 text-center">
              {isRejectedTab ? (item.reasonRejected ?? "—") : item.reason}
            </td>

            {/* Date column switches per tab */}
            {isApprovedTab || isRefundedTab ? (
              <td className="px-4 py-3 text-center">
                {item.refundedOn ?? "—"}
              </td>
            ) : isRejectedTab ? (
              <td className="px-4 py-3 text-center">
                {item.rejectedAt ?? "—"}
              </td>
            ) : (
              <td className="px-4 py-3 text-center">
                {item.dateSubmitted ?? "—"}
              </td>
            )}

            <td
              className={`px-4 py-3 text-center font-medium ${
                item.status === "In Review"
                  ? "text-yellow-500"
                  : item.status === "Pending"
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

            {showSelectionColumn && (
              <td className="px-4 py-3 text-center">
                {String(item.status).toLowerCase() === "approved" ? null : (
                  <input
                    type="checkbox"
                    className="accent-primaryYellow focus:ring-2 focus:ring-black"
                    checked={selected[index] || false}
                    onChange={() => handleCheckboxChange(index)}
                  />
                )}
              </td>
            )}
          </tr>
        ))}

        {/* Refund Details modal */}
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
                  <h1 className="text-2xl font-bold text-primaryYellow">
                    Refund Details
                  </h1>
                  <p className="text-lg text-gray-400 font-bold">
                    Refund ID: {modalData.refundId}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <h1 className="text-lg text-gray-400 font-bold">Current Status:</h1>
                  <p
                    className={`text-2xl font-bold ${
                      modalData.status === "In Review"
                        ? "text-yellow-500"
                        : modalData.status === "Pending"
                        ? "text-gray-500"
                        : "text-primaryYellow"
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
                    <p className="font-bold text-primaryYellow">
                      {isRejectedTab ? "Reason (Rejected)" : "Reason"}
                    </p>
                    <p className="text-gray-500 font-bold">
                      {isRejectedTab ? (modalData.reasonRejected ?? "—") : modalData.reason}
                    </p>
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

                  {/* Always show GCash fields */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold text-primaryYellow">GCash Name</p>
                      <p className="text-gray-500 font-bold">
                        {modalData.gcashName ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-primaryYellow">GCash Number</p>
                      <p className="text-gray-500 font-bold">
                        {modalData.gcashNumber ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 mt-2">
                    <h2 className="font-bold text-primaryYellow mb-2">Order Summary</h2>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Subtotal</span>
                      <span>
                        ₱
                        {(
                          (modalData.totalAmountPaid ?? 0) -
                          (modalData.deliveryFee ?? 0) -
                          (modalData.serviceFee ?? 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Delivery Fee</span>
                      <span>₱{Number(modalData.deliveryFee ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Service Fee</span>
                      <span>₱{Number(modalData.serviceFee ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 font-extrabold mt-2">
                      <span>Total Order</span>
                      <span>₱{Number(modalData.totalAmountPaid ?? 0).toFixed(2)}</span>
                    </div>

                    {/* ℹ️ Note */}
                    <div className="flex items-center gap-2 bg-yellow-50 mt-4 rounded-md p-3">
                      <IoInformationCircleOutline className="text-gray-600 text-xl" />
                      <p className="text-gray-600 text-sm font-semibold">
                        Service fee is not included in refund amount.
                      </p>
                    </div>

                    {/* ✅ NEW: Refunded Amount (appears for Approved/Refunded) */}
                    {(String(modalData.status).toLowerCase() === "approved" ||
                      String(modalData.status).toLowerCase() === "refunded") && (
                      <div className="flex justify-between text-gray-900 font-extrabold mt-4 border-t pt-3">
                        <span>Refunded Amount</span>
                        <span>
                          {modalData.refundedAmount != null
                            ? `₱${Number(modalData.refundedAmount).toFixed(2)}`
                            : "—"}
                        </span>
                      </div>
                    )}
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

        {/* REFUND MODAL */}
        <Modal
          isOpen={isRefundOpen}
          onRequestClose={() => {
            setIsRefundOpen(false);
            clearRefundImage();
            setRefundAmount("");
          }}
          contentLabel="Process Refund"
          style={refundModalStyle}
        >
          <div className="px-6 py-5" style={{ backgroundColor: "#fec718" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Process Refund</h1>
                <p className="text-sm text-gray-800/80 mt-1">Attach a single image as proof.</p>
              </div>
              <button
                onClick={() => {
                  setIsRefundOpen(false);
                  clearRefundImage();
                  setRefundAmount("");
                }}
                className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow"
              >
                X
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Refund Amount (₱) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <p className="mt-2 text-xs text-gray-500 font-semibold">
                Service fee is not included in the refund amount.
              </p>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image Proof (required)
            </label>

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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickRefundImage}
                className="hidden"
                aria-label="Attach refund proof image"
              />

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
                            fileInputRef.current?.click();
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

            <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4 px-0">
              <button
                onClick={() => {
                  setIsRefundOpen(false);
                  clearRefundImage();
                  setRefundAmount("");
                }}
                className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold"
                disabled={isConfirming}
              >
                Cancel
              </button>
              <button
                onClick={confirmRefund}
                disabled={!canConfirmRefund}
                className="px-5 py-2 rounded-xl text-white font-semibold shadow"
                style={{
                  backgroundColor: canConfirmRefund ? "#fec718" : "#fde68a",
                  cursor: canConfirmRefund ? "pointer" : "not-allowed",
                  opacity: isConfirming ? 0.8 : 1,
                }}
              >
                {isConfirming ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </Modal>

        {/* REJECT MODAL — UI ONLY */}
        <Modal
          isOpen={isRejectOpen}
          onRequestClose={() => {
            setIsRejectOpen(false);
            setRejectReason("");
          }}
          contentLabel="Reject Refund"
          style={refundModalStyle}
        >
          {/* Header */}
          <div className="px-6 py-5" style={{ backgroundColor: "#fec718" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Reject Refund</h1>
                <p className="text-sm text-gray-800/80 mt-1">
                  Provide a reason why this refund is canceled.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRejectOpen(false);
                  setRejectReason("")
                }}
                className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow"
              >
                X
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Describe why this refund is rejected..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <p className="mt-2 text-xs text-gray-500 font-semibold">
                This reason will be saved with the refund record.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4 px-0">
              <button
                onClick={() => {
                  setIsRejectOpen(false);
                  setRejectReason("");
                }}
                className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold"
                disabled={isRejecting}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!canConfirmReject}
                className="px-5 py-2 rounded-xl text-white font-semibold shadow"
                style={{
                  backgroundColor: canConfirmReject ? "#fec718" : "#fde68a",
                  cursor: canConfirmReject ? "pointer" : "not-allowed",
                  opacity: isRejecting ? 0.8 : 1,
                }}
              >
                {isRejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </Modal>
      </Table>
    </>
  );
}
