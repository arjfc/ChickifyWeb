// components/admin/tables/PayoutReqTable.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import dayjs from "dayjs";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
import Modal from "react-modal";
import { supabase } from "@/lib/supabase";
import {
  fetchPayoutOverviewList,
  adminApprovePayout,
  adminRejectPayout,
} from "@/services/Payoutrequest";

/* ---------- Modal styles ---------- */
const baseModalStyle = {
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
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
};

const detailsModalStyle = baseModalStyle;
const approvePayoutModalStyle = {
  content: {
    ...baseModalStyle.content,
    width: "720px",
    padding: 0,
    overflow: "auto",
    borderRadius: 24,
  },
  overlay: baseModalStyle.overlay,
};
const confirmModalStyle = {
  content: {
    ...baseModalStyle.content,
    width: 480,
    padding: 0,
    overflow: "hidden",
    borderRadius: 20,
  },
  overlay: baseModalStyle.overlay,
};
/* ---------------------------------- */

export default function PayoutReqTable({ selectedOption, date = "all" }) {
  // selection states
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // ❗ NEW: modal to tell user to select only 1 checkbox
  const [onlyOneCheckboxModalOpen, setOnlyOneCheckboxModalOpen] =
    useState(false);

  // data states
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchPayoutOverviewList({ signImages: true });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  // Helpers
  const mmddyy = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    const yy = String(dt.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  const isSelectableStatus = (status) =>
    !["approved", "rejected"].includes(String(status).toLowerCase());

  const formatStatus = (status) => {
    const raw = String(status || "").toLowerCase();
    if (!raw) return { raw: "", label: "—" };
    return { raw, label: raw.charAt(0).toUpperCase() + raw.slice(1) };
  };

  const statusColorClass = (raw) => {
    switch (raw) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-500";
      case "pending":
      case "processing":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // ===== DATE RANGE FILTER =====
  const inRange = useCallback((iso, range) => {
    if (!iso) return false;
    if (!range || range === "all") return true;

    const d = dayjs(iso);
    if (!d.isValid()) return false;

    const now = dayjs();
    const todayStart = now.startOf("day");
    const todayEnd = now.endOf("day");

    switch (range) {
      case "today":
        return (
          d.isAfter(todayStart.subtract(1, "millisecond")) &&
          d.isBefore(todayEnd.add(1, "millisecond"))
        );
      case "yesterday": {
        const yStart = todayStart.subtract(1, "day");
        const yEnd = todayEnd.subtract(1, "day");
        return (
          d.isAfter(yStart.subtract(1, "millisecond")) &&
          d.isBefore(yEnd.add(1, "millisecond"))
        );
      }
      case "7": {
        const start = now.startOf("day").subtract(6, "day");
        return (
          d.isAfter(start.subtract(1, "millisecond")) &&
          d.isBefore(todayEnd.add(1, "millisecond"))
        );
      }
      case "30": {
        const start = now.startOf("day").subtract(29, "day");
        return (
          d.isAfter(start.subtract(1, "millisecond")) &&
          d.isBefore(todayEnd.add(1, "millisecond"))
        );
      }
      case "last_month": {
        const lastMonthStart = now.subtract(1, "month").startOf("month");
        const lastMonthEnd = now.subtract(1, "month").endOf("month");
        return (
          d.isAfter(lastMonthStart.subtract(1, "millisecond")) &&
          d.isBefore(lastMonthEnd.add(1, "millisecond"))
        );
      }
      default:
        return true;
    }
  }, []);
  // ================================================

  const isRejectedTab =
    String(selectedOption || "").toLowerCase() === "rejected";

  // Map RPC rows -> table shape
  const mapped = useMemo(
    () =>
      rows.map((r) => ({
        payoutID: r.payout_id,
        requestor: r.requestor_name || "—",
        amount: Number(r.amount || 0),
        requestDate: mmddyy(r.request_date || r.requested_at),

        processedAtRaw: r.processed_at ?? null,
        processedAt: r.processed_at ? mmddyy(r.processed_at) : null,
        processedBy: r.processed_by_name ?? r.processed_by ?? null,

        status: r.status || "Pending",
        gcashName: r.gcash_name ?? null,
        gcashNumber: r.gcash_number ?? null,
        proofImageUrl: r.img_url_signed ?? r.img_url ?? undefined,

        // reason field from view
        rejectReason: r.reason ?? r.reject_reason ?? null,

        __raw: r,
      })),
    [rows]
  );

  // Tab + Date filters
  const payoutReqData = useMemo(() => {
    const byTab =
      selectedOption && selectedOption !== "All"
        ? mapped.filter(
            (c) =>
              String(c.status).toLowerCase() ===
              String(selectedOption).toLowerCase()
          )
        : mapped;

    const refDate = (c) =>
      c.__raw?.request_date ?? c.__raw?.requested_at ?? null;
    return byTab.filter((c) => inRange(refDate(c), date));
  }, [mapped, selectedOption, date, inRange]);

  // show processed column only outside Pending tab
  const showProcessedColumn =
    String(selectedOption || "All").toLowerCase() !== "pending";

  const headers = (() => {
    if (showProcessedColumn) {
      if (isRejectedTab) {
        return [
          "Payout ID",
          "Requestor (Farmer)",
          "Amount",
          "Request Date",
          "Processed At",
          "Status",
          "Reason",
          "Action",
          "",
        ];
      }
      return [
        "Payout ID",
        "Requestor (Farmer)",
        "Amount",
        "Request Date",
        "Processed At",
        "Status",
        "Action",
        "",
      ];
    } else {
      return [
        "Payout ID",
        "Requestor (Farmer)",
        "Amount",
        "Request Date",
        "Status",
        "Action",
        "",
      ];
    }
  })();

  const handleCheckboxChange = (index) => {
    const item = payoutReqData[index];
    if (!isSelectableStatus(item?.status)) return;
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setSelectAll(updated.every(Boolean));
  };

  useEffect(() => {
    setSelected(Array(payoutReqData.length).fill(false));
    setSelectAll(false);
  }, [payoutReqData.length]);

  const selectedItems = useMemo(
    () =>
      payoutReqData.filter(
        (row, i) => isSelectableStatus(row.status) && selected[i]
      ),
    [payoutReqData, selected]
  );

  // ---------- Details modal ----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalError, setModalError] = useState("");
  const viewDetails = (row) => {
    setModalError("");
    setModalData(row);
    setIsModalOpen(true);
  };

  // ---------- Approve Payout modal ----------
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutImageFile, setPayoutImageFile] = useState(null);
  const [payoutImagePreview, setPayoutImagePreview] = useState(null);
  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [actionError, setActionError] = useState("");
  const fileInputRef = useRef(null);

  const onPickPayoutImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayoutImageFile(file);
    setPayoutImagePreview(URL.createObjectURL(file));
  }, []);

  const clearPayoutImage = useCallback(() => {
    setPayoutImageFile(null);
    setPayoutImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const resetApprovePayoutModal = useCallback(() => {
    clearPayoutImage();
    setPayoutAmount("");
    setGcashName("");
    setGcashNumber("");
    setActionError("");
  }, [clearPayoutImage]);

  const canConfirmPayout =
    !!payoutImageFile && !!payoutAmount && parseFloat(payoutAmount) > 0 && !isConfirming;

  const confirmPayout = useCallback(
    async () => {
      if (!canConfirmPayout) return;
      setIsConfirming(true);
      setActionError("");
      try {
        const target = selectedItems[0];
        if (!target) throw new Error("No payout selected.");
        const payoutId = target.payoutID;

        const file = payoutImageFile;
        const ext = (file?.name?.split(".").pop() || "jpg").toLowerCase();
        const path = `proofs/${payoutId}_${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("payout-proofs")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage
          .from("payout-proofs")
          .getPublicUrl(path);
        const proofUrl = pub?.publicUrl || null;

        const memoParts = [];
        if (payoutAmount) memoParts.push(`amount-entered=${payoutAmount}`);
        if (gcashName) memoParts.push(`gcash_name=${gcashName}`);
        if (gcashNumber) memoParts.push(`gcash_number=${gcashNumber}`);
        const memo = memoParts.join(" | ") || null;

        await adminApprovePayout({ payoutId, proofUrl, method: "GCash", memo });

        await loadRows();
        setIsPayoutOpen(false);
        resetApprovePayoutModal();
      } catch (e) {
        setActionError(e?.message || "Failed to approve payout.");
      } finally {
        setIsConfirming(false);
      }
    },
    [
      canConfirmPayout,
      selectedItems,
      payoutImageFile,
      payoutAmount,
      gcashName,
      gcashNumber,
      loadRows,
      resetApprovePayoutModal,
    ]
  );

  // ---------- Reject Confirmation Modal ----------
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectIds, setRejectIds] = useState([]);
  const [rejectError, setRejectError] = useState("");
  const [rejectBusy, setRejectBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const openRejectConfirm = (ids) => {
    setRejectIds(ids);
    setRejectError("");
    setRejectReason("");
    setRejectModalOpen(true);
  };
  const closeRejectConfirm = () => {
    setRejectModalOpen(false);
    setRejectIds([]);
    setRejectError("");
    setRejectReason("");
  };

  const confirmRejectNow = useCallback(
    async () => {
      if (!rejectIds.length) return;

      if (!rejectReason.trim()) {
        setRejectError("Please provide a reason for rejecting the payout.");
        return;
      }

      setRejectBusy(true);
      setRejectError("");
      try {
        for (const id of rejectIds) {
          await adminRejectPayout({
            payoutId: id,
            reason: rejectReason.trim(),
          });
        }
        await loadRows();
        setSelected(Array(payoutReqData.length).fill(false));
        setSelectAll(false);
        closeRejectConfirm();
        if (isModalOpen) {
          setIsModalOpen(false);
          setModalData(null);
        }
      } catch (e) {
        setRejectError(e?.message || "Failed to reject payout(s).");
      } finally {
        setRejectBusy(false);
      }
    },
    [
      rejectIds,
      rejectReason,
      loadRows,
      payoutReqData.length,
      isModalOpen,
    ]
  );

  // ====== EVENTS FROM PARENT (approve / reject) ======

  // Approve: open modal only if EXACTLY ONE row is selected
  useEffect(() => {
    const openApprove = () => {
      if (selectedItems.length === 1) {
        setIsPayoutOpen(true);
      } else {
        // ❗ Show "check only 1 checkbox" modal
        setOnlyOneCheckboxModalOpen(true);
      }
    };
    window.addEventListener("openRefundModal", openApprove);
    window.addEventListener("openPayoutModal", openApprove);
    return () => {
      window.removeEventListener("openRefundModal", openApprove);
      window.removeEventListener("openPayoutModal", openApprove);
    };
  }, [selectedItems]);

  // Reject: open confirmation only if EXACTLY ONE row is selected
  useEffect(() => {
    const handler = () => {
      if (selectedItems.length !== 1) {
        // ❗ Show "check only 1 checkbox" modal
        setOnlyOneCheckboxModalOpen(true);
        return;
      }
      const target = selectedItems[0];
      openRejectConfirm([target.payoutID]);
    };
    window.addEventListener("rejectPayoutDirect", handler);
    return () => window.removeEventListener("rejectPayoutDirect", handler);
  }, [selectedItems]);

  // Auto-fill payout amount when approve modal opens
  useEffect(() => {
    if (!isPayoutOpen) return;
    if (!selectedItems.length) return;

    const first = selectedItems[0];
    const amt =
      typeof first.amount === "number"
        ? first.amount
        : Number(first.amount || 0);

    if (!Number.isNaN(amt) && amt > 0) {
      setPayoutAmount((prev) => (prev === "" ? String(amt) : prev));
    }
  }, [isPayoutOpen, selectedItems]);

  return (
    <Table headers={headers}>
      {loading && (
        <tr>
          <td
            className="px-4 py-3 text-center text-gray-500"
            colSpan={headers.length}
          >
            Loading payouts…
          </td>
        </tr>
      )}
      {err && !loading && (
        <tr>
          <td
            className="px-4 py-3 text-center text-red-600"
            colSpan={headers.length}
          >
            {err}
          </td>
        </tr>
      )}
      {!loading && !err && payoutReqData.length === 0 && (
        <tr>
          <td
            className="px-4 py-3 text-center text-gray-500"
            colSpan={headers.length}
          >
            No records found
          </td>
        </tr>
      )}

      {!loading &&
        !err &&
        payoutReqData.map((item, index) => {
          const { raw: rawStatus, label: statusLabel } = formatStatus(
            item.status
          );
          const showProcessedForRow =
            rawStatus === "approved" ||
            rawStatus === "rejected" ||
            rawStatus === "processing";

          return (
            <tr
              key={index}
              className="bg-yellow-100 text-gray-700 rounded-lg shadow-sm transition"
            >
              <td className="px-4 py-3 text-center font-medium">
                {item.payoutID}
              </td>
              <td className="px-4 py-3 text-center">{item.requestor}</td>
              <td className="px-4 py-3 text-center">
                ₱{item.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-center">{item.requestDate}</td>

              {showProcessedColumn && (
                <td className="px-4 py-3 text-center">
                  {showProcessedForRow ? item.processedAt || "—" : ""}
                </td>
              )}

              <td
                className={`px-4 py-3 text-center font-medium ${statusColorClass(
                  rawStatus
                )}`}
              >
                {statusLabel}
              </td>

              {isRejectedTab && showProcessedColumn && (
                <td className="px-4 py-3 text-center text-gray-700">
                  {item.rejectReason || "—"}
                </td>
              )}

              <td
                onClick={() => viewDetails(item)}
                className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
                title="View Details"
              >
                <FaCircleInfo />
              </td>

              <td className="px-4 py-3 text-center">
                {isSelectableStatus(rawStatus) ? (
                  <input
                    type="checkbox"
                    className="accent-primaryYellow focus:ring-2 focus:ring-black"
                    checked={selected[index] || false}
                    onChange={() => handleCheckboxChange(index)}
                  />
                ) : null}
              </td>
            </tr>
          );
        })}

      {/* ------- Details Modal ------- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Payout Request Details"
        style={detailsModalStyle}
      >
        {modalData &&
          (() => {
            const { raw: rawStatus, label: statusLabel } = formatStatus(
              modalData.status
            );
            const showProof = rawStatus === "approved";
            const showProcessedBlock =
              rawStatus === "approved" ||
              rawStatus === "rejected" ||
              rawStatus === "processing";

            return (
              <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-primaryYellow">
                      Payout Details
                    </h1>
                    <p className="text-lg text-gray-400 font-bold">
                      Payout ID: {modalData.payoutID}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <h1 className="text-lg text-gray-400 font-bold">
                      Current Status:
                    </h1>
                    <p
                      className={`text-2xl font-bold ${statusColorClass(
                        rawStatus
                      )}`}
                    >
                      {statusLabel}
                    </p>
                  </div>
                </div>

                {modalError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">
                    {modalError}
                  </div>
                )}

                <div className="border-2 p-5 rounded-lg w-full flex gap-8 items-start">
                  {showProof && (
                    <div className="flex flex-col items-center w-1/2 -ml-8">
                      <p className="font-bold text-primaryYellow mb-2">
                        Image Proof
                      </p>
                      {modalData.proofImageUrl ? (
                        <img
                          src={modalData.proofImageUrl}
                          alt="Proof"
                          className="rounded-lg border"
                          style={{ width: 300, height: "auto" }}
                        />
                      ) : (
                        <p className="text-gray-500">No image provided</p>
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col gap-3 ${
                      showProof ? "w-1/2 -ml-4" : "w-full"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="font-bold text-primaryYellow">
                          Requestor
                        </p>
                        <p className="text-gray-500 font-bold">
                          {modalData.requestor}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-primaryYellow">
                          Request Date
                        </p>
                        <p className="text-gray-500 font-bold">
                          {modalData.requestDate}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="font-bold text-primaryYellow">Amount</p>
                        <p className="text-gray-700 font-extrabold">
                          ₱{modalData.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-primaryYellow">
                          Payout ID
                        </p>
                        <p className="text-gray-500 font-bold">
                          {modalData.payoutID}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t pt-4">
                      <div>
                        <p className="font-bold text-primaryYellow">
                          GCash Name
                        </p>
                        <p className="text-gray-500 font-bold">
                          {modalData.gcashName ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-primaryYellow">
                          GCash Number
                        </p>
                        <p className="text-gray-500 font-bold">
                          {modalData.gcashNumber ?? "N/A"}
                        </p>
                      </div>
                    </div>

                    {showProcessedBlock && (
                      <div className="grid grid-cols-2 gap-8 border-t pt-4">
                        <div>
                          <p className="font-bold text-primaryYellow">
                            Processed At
                          </p>
                          <p className="text-gray-500 font-bold">
                            {modalData.processedAt || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-primaryYellow">
                            Processed By
                          </p>
                          <p className="text-gray-500 font-bold">
                            {modalData.processedBy ?? "—"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reason for rejection (no extra line above) */}
                    {rawStatus === "rejected" && (
                      <div className="pt-4">
                        <p className="font-bold text-primaryYellow">
                          Reason for Rejection
                        </p>
                        <p className="text-gray-500 font-bold whitespace-pre-line">
                          {modalData.rejectReason || "—"}
                        </p>
                      </div>
                    )}
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
            );
          })()}
      </Modal>

      {/* ------- APPROVE PAYOUT Modal ------- */}
      <Modal
        isOpen={isPayoutOpen}
        onRequestClose={() => {
          setIsPayoutOpen(false);
          resetApprovePayoutModal();
        }}
        contentLabel="Process Payout"
        style={approvePayoutModalStyle}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ backgroundColor: "#fec718" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Process Payout
              </h1>
              <p className="text-sm text-gray-800/80 mt-1">
                Attach a single image as proof.
              </p>
            </div>
            <button
              onClick={() => {
                setIsPayoutOpen(false);
                resetApprovePayoutModal();
              }}
              className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow"
            >
              X
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {!!actionError && (
            <div className="mb-4 text-sm font-semibold text-red-600">
              {actionError}
            </div>
          )}

          {/* Amount */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payout Amount (₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <p className="mt-2 text-xs text-gray-500 font-semibold">
              Service fee is not included in the payout amount.
            </p>
          </div>

          {/* Image Proof */}
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Image Proof (required)
          </label>
          <div
            onClick={() => {
              if (!payoutImagePreview) fileInputRef.current?.click();
            }}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6"
            style={
              payoutImagePreview
                ? { borderColor: "#86efac", backgroundColor: "#f0fdf4" }
                : { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
            }
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-700">
                {payoutImagePreview ? "Image selected" : "Click to upload"}
              </div>
              <div className="text-xs text-gray-500 mt-1">JPG, PNG</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPickPayoutImage}
              className="hidden"
            />

            {payoutImagePreview && (
              <div className="mt-4 w-full">
                <div className="rounded-xl border bg-white p-3 shadow-sm">
                  <img
                    src={payoutImagePreview}
                    alt="Payout Proof Preview"
                    className="rounded-lg max-h-64 w-full object-contain"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {payoutImageFile?.name ?? "Selected Image"}
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
                          clearPayoutImage();
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

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4 px-0">
            <button
              onClick={() => {
                setIsPayoutOpen(false);
                resetApprovePayoutModal();
              }}
              className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold"
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              onClick={confirmPayout}
              disabled={!canConfirmPayout}
              className="px-5 py-2 rounded-xl text-white font-semibold shadow"
              style={{
                backgroundColor: canConfirmPayout ? "#16a34a" : "#86efac",
                cursor: canConfirmPayout ? "pointer" : "not-allowed",
                opacity: isConfirming ? 0.8 : 1,
              }}
            >
              {isConfirming ? "Processing..." : "Confirm Payout"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ------- REJECT CONFIRMATION MODAL ------- */}
      <Modal
        isOpen={rejectModalOpen}
        onRequestClose={rejectBusy ? undefined : closeRejectConfirm}
        contentLabel="Confirm Reject Payout"
        style={confirmModalStyle}
      >
        <div className="p-6">
          <h2 className="text-xl font-extrabold text-gray-900">
            Reject Payout Request
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {rejectIds.length === 1 ? (
              <>
                Are you sure you want to reject payout{" "}
                <span className="font-semibold">#{rejectIds[0]}</span>?
              </>
            ) : (
              <>
                Are you sure you want to reject these{" "}
                <span className="font-semibold">{rejectIds.length}</span>{" "}
                payouts?
              </>
            )}
          </p>

          {rejectIds.length > 1 && (
            <div className="mt-3 max-h-32 overflow-auto rounded border bg-gray-50 p-2 text-xs text-gray-700">
              {rejectIds.map((id) => (
                <div key={id} className="py-0.5">
                  • #{id}
                </div>
              ))}
            </div>
          )}

          {/* Reason for rejection */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for rejecting this payout…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-200"
              disabled={rejectBusy}
            />
          </div>

          {!!rejectError && (
            <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-2 text-sm font-semibold text-red-700">
              {rejectError}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={closeRejectConfirm}
              disabled={rejectBusy}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={confirmRejectNow}
              disabled={rejectBusy}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {rejectBusy ? "Rejecting…" : "Yes, Reject"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ------- ONLY ONE CHECKBOX WARNING MODAL ------- */}
      <Modal
        isOpen={onlyOneCheckboxModalOpen}
        onRequestClose={() => setOnlyOneCheckboxModalOpen(false)}
        contentLabel="Selection Warning"
        style={confirmModalStyle}
      >
        <div className="p-6">
          <h2 className="text-xl font-extrabold text-gray-900">
            Check only 1 checkbox
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select exactly one payout request by checking only one checkbox
            before proceeding.
          </p>
          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={() => setOnlyOneCheckboxModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-primaryYellow text-white font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </Table>
  );
}
