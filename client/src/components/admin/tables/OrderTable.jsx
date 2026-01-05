// components/admin/tables/OrderTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import Table from "../../Table";
import { FaCircleInfo } from "react-icons/fa6";
import Modal from "react-modal";
import {
  listOrdersForTable,
  adminGetFullOrderDetails,
} from "@/services/OrderNAllocation";
import { fetchSizeMetaMap } from "@/services/EggInventory";

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
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1000 },
};

const statusColors = {
  Confirmed: "text-blue-600",
  "To Ship": "text-indigo-600",
  Shipped: "text-purple-600",
  Delivered: "text-green-600",
  Cancelled: "text-red-600",
  Refunded: "text-orange-500",
};

function fmtDateMDY(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  const date = dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const time = dt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

export default function OrderTable({
  selectedOption,
  status,
  mode = "none",
  selectedIds = [],
  onSelectionChange = () => {},
  refreshKey = 0,
}) {
  const effectiveStatus = status ?? selectedOption ?? null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);
  const [sizeMeta, setSizeMeta] = useState({});

  // size meta for "Needs" column
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const meta = await fetchSizeMetaMap();
        if (!alive) return;
        setSizeMeta(meta || {});
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [5, 10, 25, 50];

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // fetch table rows
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const apiRows = await listOrdersForTable({ status: effectiveStatus });
        if (!alive) return;

        const shaped = (apiRows || []).map((r) => ({
          orderID: r.id,
          customerName: r.customer || "—",
          dateOrdered: fmtDateMDY(r.dateOrdered),
          totalAmount: Number(r.totalAmount ?? 0).toFixed(2),
          orderStatus: r.orderStatus || "—",
          paymentStatus: r.paymentStatus || "—",
          phoneNumber: "—",
          address: r.buyerCoopName || "—",
          shipping_mode: r.shipping_mode || r.shippingMode || null, // 👈 important
          raw: r,
        }));

        setRows(shaped);
        setPage(1);
      } catch (e) {
        if (!alive) return;
        setLoadErr(e?.message || "Failed to load orders.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [effectiveStatus, refreshKey]);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalRows);
  const currentRows = useMemo(
    () => rows.slice(startIdx, endIdx),
    [rows, startIdx, endIdx]
  );

  const isSelected = (id) => selectedIds.includes(id);

  // helper: get selected row objects for a list of IDs
  const getSelectedRows = (ids) =>
    ids
      .map((id) => rows.find((r) => r.orderID === id))
      .filter(Boolean);

  const toggleCheckbox = (id) => {
    if (mode !== "multi") return;
    const next = isSelected(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    const metaRows = getSelectedRows(next);
    onSelectionChange(next, metaRows);
  };

  const selectAllOnPage = (checked) => {
    if (mode !== "multi") return;
    const pageIds = currentRows.map((r) => r.orderID);
    const pageSet = new Set(pageIds);
    let next;
    if (checked) {
      next = Array.from(new Set([...selectedIds, ...pageIds]));
    } else {
      next = selectedIds.filter((id) => !pageSet.has(id));
    }
    const metaRows = getSelectedRows(next);
    onSelectionChange(next, metaRows);
  };

  const setRadio = (id) => {
    if (mode !== "single") return;
    const next = id ? [id] : [];
    const metaRows = getSelectedRows(next);
    onSelectionChange(next, metaRows);
  };

  const selectionHeader =
    mode === "multi" ? (
      <input
        key="selectAll"
        type="checkbox"
        className="accent-primaryYellow focus:ring-2 focus:ring-black"
        onChange={(e) => selectAllOnPage(e.target.checked)}
        checked={
          currentRows.length > 0 &&
          currentRows.every((r) => selectedIds.includes(r.orderID))
        }
      />
    ) : mode === "single" ? (
      <span key="selectOne" className="text-xs text-gray-500">
        Select
      </span>
    ) : (
      <span key="blank" />
    );

  const headers = [
    "Order ID",
    "Customer",
    "Date Ordered",
    "Total Amount",
    "Needs",
    "Order Status",
    "Payment Status",
    "Details",
    selectionHeader,
  ];

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const labelFromSizeId = (sid) => {
    const entry = Object.entries(sizeMeta).find(
      ([, v]) => Number(v.id) === Number(sid)
    );
    return entry ? entry[0] : `#${sid}`;
  };

  /* -------------------------- modal handler --------------------------- */
  const viewOrderDetails = async (item) => {
    // base info from table
    setIsModalOpen(true);
    setModalData(item);
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const full = await adminGetFullOrderDetails(item.orderID);
      console.log("[OrderDetails] full RPC data:", full);
      // merge table info + RPC info
      setModalData((prev) => ({
        ...(prev || {}),
        ...(full || {}),
      }));
    } catch (e) {
      console.error("Failed to load full order details:", e);
      setDetailsError(e?.message || "Failed to load order details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const itemsArray = Array.isArray(modalData?.items)
    ? modalData.items
    : modalData?.items
    ? JSON.parse(modalData.items)
    : [];

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <div className="relative">
            <select
              className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <span>
            Displaying {totalRows === 0 ? 0 : startIdx + 1}-{endIdx} of{" "}
            {totalRows}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-gray-500 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-300 font-semibold disabled:opacity-50"
            onClick={onPrev}
            disabled={safePage <= 1 || loading}
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {safePage} / {totalPages}
          </span>
          <button
            className="rounded-md border border-yellow-600 bg-white px-3.5 py-1.5 text-[12px] font-medium text-yellow-500 hover:bg-yellow-300 hover:text-yellow-700 disabled:opacity-50"
            onClick={onNext}
            disabled={safePage >= totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>

      <Table headers={headers}>
        {loading && (
          <tr>
            <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
              Loading orders…
            </td>
          </tr>
        )}

        {!loading && loadErr && (
          <tr>
            <td colSpan={9} className="px-4 py-6 text-center text-red-600">
              {loadErr}
            </td>
          </tr>
        )}

        {!loading && !loadErr && currentRows.length === 0 && (
          <tr>
            <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
              No orders found.
            </td>
          </tr>
        )}

        {!loading &&
          !loadErr &&
          currentRows.map((item, index) => {
            const needsBy = new Map();
            for (const p of item.raw?.products || []) {
              const sid = Number(p.size_id || 0);
              const trays = Number(p.tray_qty || 0);
              if (!sid || trays <= 0) continue;
              needsBy.set(sid, (needsBy.get(sid) || 0) + trays);
            }
            const needsStr = Array.from(needsBy.entries())
              .map(([sid, t]) => `${labelFromSizeId(sid)}×${t}`)
              .join(", ");

            const selected = isSelected(item.orderID);

            return (
              <tr
                key={`${item.orderID}-${startIdx + index}`}
                className={`text-gray-700 rounded-lg shadow-sm transition ${
                  selected
                    ? "bg-yellow-200 border-l-4 border-primaryYellow"
                    : "bg-yellow-100 hover:bg-yellow-50"
                }`}
              >
                <td className="px-4 py-3 text-center font-medium">
                  {item.orderID}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.customerName}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.dateOrdered}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.totalAmount}
                </td>
                <td className="px-4 py-3 text-center">
                  {needsStr || "—"}
                </td>
                <td
                  className={`px-4 py-3 text-center font-medium ${
                    statusColors[item.orderStatus] || "text-gray-500"
                  }`}
                >
                  {item.orderStatus}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.paymentStatus}
                </td>
                <td
                  onClick={() => viewOrderDetails(item)}
                  className="cursor-pointer px-4 py-3 flex items-center justify-center text-gray-400"
                  title="View details"
                >
                  <FaCircleInfo />
                </td>

                <td className="px-4 py-3 text-center">
                  {mode === "multi" ? (
                    <input
                      type="checkbox"
                      className="accent-primaryYellow focus:ring-2 focus:ring-black"
                      checked={selected}
                      onChange={() => toggleCheckbox(item.orderID)}
                    />
                  ) : mode === "single" ? (
                    <input
                      type="radio"
                      name="order-single-select"
                      className="accent-primaryYellow focus:ring-2 focus:ring-black"
                      checked={selected}
                      onChange={() => setRadio(item.orderID)}
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}

        {/* DETAILS MODAL */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
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
                    Order #: {modalData.orderID ?? modalData.order_id}
                  </p>
                </div>
                <div className="flex flex-col leading-tight items-end">
                  <h1 className="text-lg text-gray-400 font-bold">
                    Current Status:
                  </h1>
                  <p className="text-2xl font-bold text-primaryYellow">
                    {modalData.order_status || modalData.orderStatus}
                  </p>
                </div>
              </div>

              <div className="flex flex-col leading-tight">
                <h1 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                  {modalData.customer_name || modalData.customerName}{" "}
                  <span className="text-gray-400">
                    {modalData.customer_phone || modalData.phoneNumber || "—"}
                  </span>
                </h1>
                <h2 className="flex items-center gap-3 font-bold text-lg text-gray-700">
                  {modalData.address || "—"}
                </h2>
              </div>

              <div className="flex flex-row gap-5">
                {/* Item summary */}
                <div className="border-2 p-5 rounded-lg w-full">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-lg text-primaryYellow font-bold mb-5">
                      Item Summary
                    </h1>

                    {detailsLoading && (
                      <div className="text-gray-500 text-sm">
                        Loading order details…
                      </div>
                    )}

                    {detailsError && (
                      <div className="text-red-600 text-sm">
                        {detailsError}
                      </div>
                    )}

                    {!detailsLoading &&
                      !detailsError &&
                      (!itemsArray || itemsArray.length === 0) && (
                        <div className="text-gray-500 text-sm">
                          No item breakdown found.
                        </div>
                      )}

                    {!detailsLoading &&
                      !detailsError &&
                      itemsArray &&
                      itemsArray.length > 0 && (
                        <div className="space-y-2 text-sm text-gray-800">
                          {itemsArray.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between border-b border-gray-100 pb-1"
                            >
                              <div>
                                <div className="font-semibold">
                                  {it.egg_size}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {it.trays} trays
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 self-center">
                                {it.total_eggs} eggs
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Order + delivery summary */}
                <div className="border-2 p-5 rounded-lg w-full">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-lg text-primaryYellow font-bold mb-5">
                      Order Summary
                    </h1>

                    <div className="flex flex-row justify-between items-center font-bold text-lg">
                      <p>Total Order</p>
                      <p>₱{modalData.totalAmount}</p>
                    </div>

                    <div className="flex flex-row justify-between items-center text-primaryYellow font-bold text-lg">
                      <p>Payment Method</p>
                      <p>
                        {modalData.payment_method ||
                          modalData.paymentMethod ||
                          "—"}
                      </p>
                    </div>

                    <div className="flex flex-row justify-between items-center text-sm text-gray-700">
                      <p>Payment Status</p>
                      <p>
                        {modalData.payment_status ||
                          modalData.paymentStatus ||
                          "—"}
                      </p>
                    </div>

                    <div className="flex flex-row justify-between items-center text-sm text-gray-700">
                      <p>Paid At</p>
                      <p>{fmtDateMDY(modalData.payment_paid_at)}</p>
                    </div>

                    <div className="flex flex-row justify-between items-center text-sm text-gray-700">
                      <p>Shipping Mode</p>
                      <p>{modalData.shipping_mode || "—"}</p>
                    </div>

                    {/* Delivery / trucking section */}
                    <div className="mt-4 border-t pt-3 space-y-1 text-sm text-gray-700">
                      <div className="flex flex-row justify-between items-center">
                        <p>Delivery Status</p>
                        <p>{modalData.delivery_status || "—"}</p>
                      </div>

                      <div className="flex flex-row justify-between items-center">
                        <p>Delivery Schedule</p>
                        <p>{fmtDateTime(modalData.delivery_schedule)}</p>
                      </div>

                      <div className="flex flex-row justify-between items-center">
                        <p>Driver</p>
                        <p>{modalData.delivery_driver_name || "—"}</p>
                      </div>

                      <div className="flex flex-row justify-between items-center">
                        <p>Company</p>
                        <p>{modalData.delivery_company || "—"}</p>
                      </div>

                      <div className="flex flex-row justify-between items-center">
                        <p>Truck #</p>
                        <p>{modalData.delivery_truck_number || "—"}</p>
                      </div>

                      <div className="flex flex-row justify-between items-center">
                        <p>Plate #</p>
                        <p>{modalData.delivery_plate_number || "—"}</p>
                      </div>

                      <div className="flex flex-row justify-between items-center">
                        <p>Driver Phone</p>
                        <p>{modalData.delivery_phone_number || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer bg-primaryYellow text-white font-bold text-lg rounded-lg px-10 py-3"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </Modal>
      </Table>
    </div>
  );
}
