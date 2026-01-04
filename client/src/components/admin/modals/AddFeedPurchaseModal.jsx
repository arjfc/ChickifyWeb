// components/admin/modals/AddFeedPurchaseModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { listMyFeedTypes } from "../../../services/FeedEntry";
import { addFeedPurchaseForCoop, updateFeedPurchaseForCoop } from "../../../services/FeedPurchase";

export default function AddFeedPurchaseModal({ open, onClose, onSuccess, editMode = false, editData = null }) {
  const [feedTypes, setFeedTypes] = useState([]);
  const [loadingFeedTypes, setLoadingFeedTypes] = useState(false);
  const [feedTypesError, setFeedTypesError] = useState("");

  const [addingPurchase, setAddingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseFormData, setPurchaseFormData] = useState({
    feed_type_id: "",
    qty_value: "",
    qty_unit: "kg", // "kg" or "sacks"
    price_value: "",
    price_type: "per_kg", // "per_kg" or "per_sack"
    purchased_date: dayjs(),
  });

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (editMode && editData && open) {
      // Auto-select the feed type
      setPurchaseFormData(prev => ({
        ...prev,
        feed_type_id: editData.feedType.feed_type_id.toString()
      }));
      
      // If there's only one purchase, auto-select it
      if (editData.purchases && editData.purchases.length === 1) {
        const purchase = editData.purchases[0];
        const packSize = Number(editData.feedType.pack_size_kg || 0);
        const unitPrice = Number(purchase.unit_price || purchase.purchase_unit_price_per_kg || 0);
        
        setSelectedPurchase(purchase);
        setPurchaseFormData({
          feed_type_id: purchase.feed_type_id.toString(),
          qty_value: purchase.qty_kg.toString(),
          qty_unit: "kg",
          price_value: unitPrice.toString(),
          price_type: "per_kg",
          purchased_date: purchase.purchased_at ? dayjs(purchase.purchased_at) : dayjs(),
        });
      }
    }
  }, [editMode, editData, open]);
  useEffect(() => {
    if (!open) return;

    let alive = true;

    const load = async () => {
      try {
        setLoadingFeedTypes(true);
        setFeedTypesError("");
        
        const data = await listMyFeedTypes();
        if (!alive || !data) return;
        setFeedTypes(Array.isArray(data) ? data : []);
        
      } catch (err) {
        if (!alive) return;
        
        console.error("Failed to load feed types:", err);
        
        // Handle different error scenarios
        let errorMessage = "Failed to load feed types. Please try again.";
        
        if (!navigator.onLine) {
          errorMessage = "No internet connection. Please check your network.";
        } else if (err?.response?.status === 401 || err?.status === 401) {
          errorMessage = "Session expired. Please log in again.";
        } else if (err?.response?.status === 403 || err?.status === 403) {
          errorMessage = "Access denied. Please check your permissions.";
        } else if (err?.response?.status >= 500 || err?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (err?.message && err.message !== "No data received from server") {
          errorMessage = `Error: ${err.message}`;
        }
        
        setFeedTypesError(errorMessage);
        setFeedTypes([]); // Ensure feedTypes is always an array
        
      } finally {
        if (alive) {
          setLoadingFeedTypes(false);
        }
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [open]);

  const selectedFeedType = useMemo(() => {
    if (!purchaseFormData.feed_type_id) return null;
    const id = parseInt(purchaseFormData.feed_type_id, 10);
    return feedTypes.find((f) => f.feed_type_id === id) || null;
  }, [purchaseFormData.feed_type_id, feedTypes]);

  const packSizeKg = Number(selectedFeedType?.pack_size_kg || 0);

  // Check if quantity can be edited (use has_allocations from updated view)
  const hasAllocations = selectedPurchase && selectedPurchase.has_allocations;
  const canEditQuantity = editMode ? !hasAllocations : true;

  const qtyValueNum = Number(purchaseFormData.qty_value || 0);
  const qtyKg =
    purchaseFormData.qty_unit === "sacks" && packSizeKg > 0
      ? qtyValueNum * packSizeKg
      : qtyValueNum;

  const priceValueNum = Number(purchaseFormData.price_value || 0);

  const unitPricePerKg =
    purchaseFormData.price_type === "per_sack" && packSizeKg > 0
      ? priceValueNum / packSizeKg
      : priceValueNum;

  const pricePerSack =
    purchaseFormData.price_type === "per_kg" && packSizeKg > 0
      ? priceValueNum * packSizeKg
      : priceValueNum;

  const totalAmount =
    qtyKg > 0 && unitPricePerKg > 0 ? qtyKg * unitPricePerKg : 0;

  const showHighPriceWarning =
    (purchaseFormData.price_type === "per_kg" && unitPricePerKg > 200) ||
    (purchaseFormData.price_type === "per_sack" && priceValueNum > 20000);

  const resetForm = () => {
    setPurchaseFormData({
      feed_type_id: "",
      qty_value: "",
      qty_unit: "kg",
      price_value: "",
      price_type: "per_kg",
      purchased_date: dayjs(),
    });
    setSelectedPurchase(null);
    setPurchaseError("");
    setFeedTypesError("");
  };

  const handleClose = () => {
    if (addingPurchase) return;
    resetForm();
    onClose?.();
  };

  // Feed type change: don't auto-fill price, let quantity calculation handle it
  const handleFeedTypeChange = (feedTypeId) => {
    setPurchaseFormData((prev) => ({ ...prev, feed_type_id: feedTypeId }));

    if (!feedTypeId) {
      setPurchaseFormData((prev) => ({ ...prev, price_value: "" }));
      return;
    }

    // Only update price_type to match qty_unit, don't auto-fill price_value
    setPurchaseFormData((prev) => {
      const nextPriceType = prev.qty_unit === "sacks" ? "per_sack" : "per_kg";
      return {
        ...prev,
        price_type: nextPriceType,
        // Don't auto-fill price_value - let quantity calculation handle it
      };
    });
  };

  // Qty unit change: auto-switch price type, don't auto-fill price
  const handleQtyUnitChange = (unit) => {
    setPurchaseFormData((prev) => {
      const nextPriceType = unit === "sacks" ? "per_sack" : "per_kg";
      let nextPriceValue = prev.price_value;
      const v = Number(prev.price_value || 0);

      // Only convert existing price values, don't auto-fill new ones
      if (String(prev.price_value ?? "").trim() !== "" && packSizeKg > 0 && v > 0) {
        if (prev.price_type === "per_kg" && nextPriceType === "per_sack") {
          nextPriceValue = v * packSizeKg;
        } else if (prev.price_type === "per_sack" && nextPriceType === "per_kg") {
          nextPriceValue = v / packSizeKg;
        }
      }
      // Don't auto-fill price if empty - let quantity calculation handle it

      return {
        ...prev,
        qty_unit: unit,
        price_type: nextPriceType,
        price_value: nextPriceValue,
      };
    });
  };

  // Price type change: convert existing value only
  const handlePriceTypeChange = (newType) => {
    setPurchaseFormData((prev) => {
      if (prev.price_type === newType) return prev;

      let nextValue = prev.price_value;
      const v = Number(prev.price_value || 0);

      // Only convert existing price values, don't auto-fill new ones
      if (packSizeKg > 0 && String(prev.price_value ?? "").trim() !== "" && v > 0) {
        if (prev.price_type === "per_kg" && newType === "per_sack") {
          nextValue = v * packSizeKg;
        } else if (prev.price_type === "per_sack" && newType === "per_kg") {
          nextValue = v / packSizeKg;
        }
      }
      // Don't auto-fill price if empty - let quantity calculation handle it

      return { ...prev, price_type: newType, price_value: nextValue };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!purchaseFormData.feed_type_id || !purchaseFormData.qty_value) {
      setPurchaseError("Please fill in all required fields.");
      return;
    }

    if (editMode && !selectedPurchase) {
      setPurchaseError("Please select a purchase to edit.");
      return;
    }

    if (purchaseFormData.qty_unit === "sacks" && (!packSizeKg || packSizeKg <= 0)) {
      setPurchaseError("Selected feed type has no pack size; cannot use sacks.");
      return;
    }

    setAddingPurchase(true);
    setPurchaseError("");

    try {
      const params = {
        purchased_at: purchaseFormData.purchased_date?.format?.("YYYY-MM-DD") ?? null,
      };

      if (editMode) {
        // Edit mode - include purchase_id and quantity if editable
        params.purchase_id = selectedPurchase.purchase_id;
        
        // Include quantity update if it can be edited
        if (canEditQuantity) {
          params.qty_kg = purchaseFormData.qty_unit === "sacks"
            ? Number(purchaseFormData.qty_value) * packSizeKg
            : Number(purchaseFormData.qty_value);
        }
      } else {
        // Add mode - include feed type and quantity
        params.feed_type_id = parseInt(purchaseFormData.feed_type_id, 10);
        params.qty_kg = purchaseFormData.qty_unit === "sacks"
          ? Number(purchaseFormData.qty_value) * packSizeKg
          : Number(purchaseFormData.qty_value);
      }

      const priceStr = String(purchaseFormData.price_value ?? "").trim();
      if (priceStr !== "") {
        const priceNum = Number(priceStr);
        if (purchaseFormData.price_type === "per_kg") {
          params.unit_price_per_kg = priceNum;
        } else {
          params.price_per_sack = priceNum;
        }
      }

      if (editMode) {
        await updateFeedPurchaseForCoop(params);
      } else {
        await addFeedPurchaseForCoop(params);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error(err);
      setPurchaseError(err.message || `Failed to ${editMode ? 'update' : 'add'} purchase. Please try again.`);
    } finally {
      setAddingPurchase(false);
    }
  };

  if (!open) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !addingPurchase) handleClose();
        }}
        className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
        aria-modal="true"
        role="dialog"
      >
        <div className="w-[500px] max-w-[95vw] rounded-2xl bg-white shadow-xl">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#F6C32B]">
                {editMode ? "Edit Purchase" : "Add New Purchase"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editMode ? "Update feed purchase details" : "Record a new feed purchase for allocation"}
              </p>
            </div>

            {/* Purchase Selection for Edit Mode */}
            {editMode && editData?.purchases && editData.purchases.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Purchase to Edit <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPurchase?.purchase_id || ""}
                  onChange={(e) => {
                    const purchaseId = parseInt(e.target.value);
                    const purchase = editData.purchases.find(p => p.purchase_id === purchaseId);
                    setSelectedPurchase(purchase);
                    
                    if (purchase) {
                      const unitPrice = Number(purchase.unit_price || purchase.purchase_unit_price_per_kg || 0);
                      
                      setPurchaseFormData({
                        feed_type_id: purchase.feed_type_id.toString(),
                        qty_value: purchase.qty_kg.toString(),
                        qty_unit: "kg",
                        price_value: unitPrice > 0 ? unitPrice.toString() : "",
                        price_type: "per_kg",
                        purchased_date: purchase.purchased_at ? dayjs(purchase.purchased_at) : dayjs(),
                      });
                    } else {
                      // Reset form if no purchase selected
                      setPurchaseFormData({
                        feed_type_id: editData?.feedType?.feed_type_id?.toString() || "",
                        qty_value: "",
                        qty_unit: "kg",
                        price_value: "",
                        price_type: "per_kg",
                        purchased_date: dayjs(),
                      });
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                  required
                >
                  <option value="">Select a purchase to edit</option>
                  {editData.purchases.map((purchase) => (
                    <option key={purchase.purchase_id} value={purchase.purchase_id}>
                      {purchase.qty_kg} kg - ₱{((purchase.unit_price || purchase.purchase_unit_price_per_kg || 0) || 0).toFixed(2)}/kg - {purchase.purchased_at ? dayjs(purchase.purchased_at).format('MMM DD, YYYY') : 'No date'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feed Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Feed Type <span className="text-red-500">*</span>
                </label>

                <select
                  value={purchaseFormData.feed_type_id}
                  onChange={(e) => handleFeedTypeChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  disabled={addingPurchase || loadingFeedTypes || editMode}
                  required
                >
                  <option value="">
                    {loadingFeedTypes ? "Loading feed types..." : feedTypesError ? "Error loading feed types" : "Select feed type"}
                  </option>
                  {feedTypes.map((feed) => (
                    <option key={feed.feed_type_id} value={feed.feed_type_id}>
                      {feed.name} {feed.brand ? `- ${feed.brand}` : ""}{" "}
                      {feed.form ? `(${feed.form})` : ""}
                    </option>
                  ))}
                </select>
                {feedTypesError && (
                  <p className="text-sm text-red-600 mt-1">{feedTypesError}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchaseFormData.qty_value}
                    onChange={(e) => {
                      const newQtyValue = e.target.value;
                      setPurchaseFormData((prev) => ({
                        ...prev,
                        qty_value: newQtyValue,
                      }));
                    }}
                    placeholder="e.g., 1000"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                    disabled={addingPurchase || (editMode && !canEditQuantity)}
                    required
                  />
                  <select
                    value={purchaseFormData.qty_unit}
                    onChange={(e) => handleQtyUnitChange(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                    disabled={addingPurchase || (editMode && !canEditQuantity)}
                  >
                    <option value="kg">kg</option>
                    {packSizeKg > 0 && <option value="sacks">sacks</option>}
                  </select>
                </div>

                {editMode && !canEditQuantity && (
                  <p className="text-sm text-amber-600 mt-1">
                    Quantity cannot be edited because this purchase has existing allocations.
                  </p>
                )}

                {/* Quantity guidance labels */}
                {selectedFeedType && (
                  <div className="mt-2 space-y-1">
                    {purchaseFormData.qty_unit === "kg" && (
                      <p className="text-sm text-blue-600">
                        Reference: 1 kg = ₱{packSizeKg > 0 ? (Number(selectedFeedType.current_price_per_kg) / packSizeKg).toFixed(2) : 'N/A'} per kg {packSizeKg > 0 ? `(₱${selectedFeedType.current_price_per_kg} ÷ ${packSizeKg}kg)` : ''}
                      </p>
                    )}
                    {purchaseFormData.qty_unit === "sacks" && packSizeKg > 0 && (
                      <p className="text-sm text-blue-600">
                        Reference: 1 sack ({packSizeKg} kg) = ₱{selectedFeedType.current_price_per_kg} per sack
                      </p>
                    )}
                  </div>
                )}

                {purchaseFormData.qty_unit === "sacks" &&
                  packSizeKg > 0 &&
                  qtyValueNum > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Total KG:{" "}
                      <span className="font-semibold">{qtyKg.toFixed(2)}</span>{" "}
                      kg
                    </p>
                  )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price{" "}
                  <span className="text-gray-400 text-xs">
                    (manual entry)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchaseFormData.price_value}
                    onChange={(e) =>
                      setPurchaseFormData((prev) => ({
                        ...prev,
                        price_value: e.target.value,
                      }))
                    }
                    placeholder="Uses feed type price if empty"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                    disabled={addingPurchase}
                  />
                  <select
                    value={purchaseFormData.price_type}
                    onChange={(e) => handlePriceTypeChange(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                    disabled={addingPurchase}
                  >
                    <option value="per_kg">per kg</option>
                    {packSizeKg > 0 && <option value="per_sack">per sack</option>}
                  </select>
                </div>

                {packSizeKg > 0 && priceValueNum > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {purchaseFormData.price_type === "per_kg"
                      ? `≈ ₱${pricePerSack.toFixed(2)} per sack`
                      : `≈ ₱${unitPricePerKg.toFixed(2)} per kg`}
                  </p>
                )}

                {showHighPriceWarning && (
                  <p className="text-sm text-red-600 mt-1">
                    This price looks unusually high. Double-check per kg vs per sack.
                  </p>
                )}
              </div>

              {/* Total */}
              {qtyKg > 0 && unitPricePerKg > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-semibold">
                    ₱
                    {totalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Purchase Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={purchaseFormData.purchased_date}
                  onChange={(newValue) =>
                    setPurchaseFormData((prev) => ({
                      ...prev,
                      purchased_date: newValue,
                    }))
                  }
                  disabled={addingPurchase}
                  slotProps={{
                    textField: {
                      className: "w-full",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "#F6C32B" },
                          "&.Mui-focused fieldset": { borderColor: "#F6C32B" },
                        },
                      },
                    },
                  }}
                />
              </div>

              {(purchaseError || feedTypesError) && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  {purchaseError && <p className="text-sm text-red-600">{purchaseError}</p>}
                  {feedTypesError && <p className="text-sm text-red-600">{feedTypesError}</p>}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={addingPurchase}
                  className="flex-1 h-11 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    addingPurchase ||
                    !purchaseFormData.feed_type_id ||
                    !purchaseFormData.qty_value ||
                    (editMode && !selectedPurchase)
                  }
                  className={`flex-1 h-11 rounded-lg font-semibold transition-all ${
                    addingPurchase ||
                    !purchaseFormData.feed_type_id ||
                    !purchaseFormData.qty_value ||
                    (editMode && !selectedPurchase)
                      ? "bg-yellow-300 text-white cursor-not-allowed"
                      : "bg-[#F6C32B] text-white hover:opacity-90 hover:shadow-lg"
                  }`}
                >
                  {addingPurchase ? (editMode ? "Updating..." : "Adding...") : (editMode ? "Update Purchase" : "Add Purchase")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}

// amazonq-ignore-next-line
// // components/admin/modals/AddFeedPurchaseModal.jsx
// import React, { useMemo, useState } from "react";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import dayjs from "dayjs";

// import { listMyFeedTypes } from "../../../services/FeedEntry";
// import { addFeedPurchaseForCoop } from "../../../services/FeedPurchase";

// export default function AddFeedPurchaseModal({
//   open,
//   onClose,
//   onSuccess, // optional callback after save (ex: refreshKey++)
// }) {
//   const [feedTypes, setFeedTypes] = useState([]);
//   const [addingPurchase, setAddingPurchase] = useState(false);
//   const [purchaseError, setPurchaseError] = useState("");

//   // Load feed types on mount
//   React.useEffect(() => {
//     const loadFeedTypes = async () => {
//       try {
//         const data = await listMyFeedTypes();
//         setFeedTypes(data);
//       } catch (err) {
//         console.error("Failed to load feed types:", err);
//       }
//     };
//     if (open) loadFeedTypes();
//   }, [open]);

//   const [purchaseFormData, setPurchaseFormData] = useState({
//     feed_type_id: "",
//     qty_value: "",
//     qty_unit: "kg", // "kg" or "sacks"
//     price_value: "",
//     price_type: "per_kg", // "per_kg" or "per_sack"
//     purchased_date: dayjs(),
//   });

//   const selectedFeedType = useMemo(() => {
//     if (!purchaseFormData.feed_type_id) return null;
//     const id = parseInt(purchaseFormData.feed_type_id, 10);
//     return feedTypes.find((f) => f.feed_type_id === id) || null;
//   }, [purchaseFormData.feed_type_id, feedTypes]);

//   const packSizeKg = Number(selectedFeedType?.pack_size_kg || 0);

//   const qtyValueNum = Number(purchaseFormData.qty_value || 0);
//   const qtyKg =
//     purchaseFormData.qty_unit === "sacks" && packSizeKg > 0
//       ? qtyValueNum * packSizeKg
//       : qtyValueNum;

//   const priceValueNum = Number(purchaseFormData.price_value || 0);

//   const unitPricePerKg =
//     purchaseFormData.price_type === "per_sack" && packSizeKg > 0
//       ? priceValueNum / packSizeKg
//       : priceValueNum;

//   const pricePerSack =
//     purchaseFormData.price_type === "per_kg" && packSizeKg > 0
//       ? priceValueNum * packSizeKg
//       : priceValueNum;

//   const totalAmount =
//     qtyKg > 0 && unitPricePerKg > 0 ? qtyKg * unitPricePerKg : 0;

//   const showHighPriceWarning =
//     (purchaseFormData.price_type === "per_kg" && unitPricePerKg > 200) ||
//     (purchaseFormData.price_type === "per_sack" && priceValueNum > 20000);

//   const resetForm = () => {
//     setPurchaseFormData({
//       feed_type_id: "",
//       qty_value: "",
//       qty_unit: "kg",
//       price_value: "",
//       price_type: "per_kg",
//       purchased_date: dayjs(),
//     });
//     setPurchaseError("");
//   };

//   const handleClose = () => {
//     if (addingPurchase) return;
//     resetForm();
//     onClose?.();
//   };

//   // Feed type change: auto-fill price depending on qty_unit
//   const handleFeedTypeChange = (feedTypeId) => {
//     setPurchaseFormData((prev) => ({ ...prev, feed_type_id: feedTypeId }));

//     if (!feedTypeId) {
//       setPurchaseFormData((prev) => ({ ...prev, price_value: "" }));
//       return;
//     }

//     const selected = feedTypes.find(
//       (f) => f.feed_type_id === parseInt(feedTypeId, 10)
//     );

//     const basePerKg = Number(selected?.current_price_per_kg || 0);
//     const pack = Number(selected?.pack_size_kg || 0);

//     setPurchaseFormData((prev) => {
//       const nextPriceType = prev.qty_unit === "sacks" ? "per_sack" : "per_kg";

//       const hasManualPrice =
//         prev.price_value !== null &&
//         prev.price_value !== undefined &&
//         String(prev.price_value).trim() !== "";

//       if (hasManualPrice) {
//         return { ...prev, price_type: nextPriceType };
//       }

//       const nextPriceValue =
//         nextPriceType === "per_sack" && pack > 0
//           ? basePerKg > 0
//             ? basePerKg * pack
//             : ""
//           : basePerKg > 0
//           ? basePerKg
//           : "";

//       return {
//         ...prev,
//         price_type: nextPriceType,
//         price_value: nextPriceValue,
//       };
//     });
//   };

//   // Qty unit change: auto-switch price type + convert value
//   const handleQtyUnitChange = (unit) => {
//     setPurchaseFormData((prev) => {
//       const nextPriceType = unit === "sacks" ? "per_sack" : "per_kg";
//       let nextPriceValue = prev.price_value;
//       const v = Number(prev.price_value || 0);

//       if (
//         String(prev.price_value || "").trim() !== "" &&
//         packSizeKg > 0 &&
//         v > 0
//       ) {
//         if (prev.price_type === "per_kg" && nextPriceType === "per_sack") {
//           nextPriceValue = v * packSizeKg;
//         } else if (
//           prev.price_type === "per_sack" &&
//           nextPriceType === "per_kg"
//         ) {
//           nextPriceValue = v / packSizeKg;
//         }
//       } else {
//         const basePerKg = Number(selectedFeedType?.current_price_per_kg || 0);
//         if (nextPriceType === "per_kg") nextPriceValue = basePerKg || "";
//         if (nextPriceType === "per_sack" && packSizeKg > 0) {
//           nextPriceValue = basePerKg ? basePerKg * packSizeKg : "";
//         }
//       }

//       return {
//         ...prev,
//         qty_unit: unit,
//         price_type: nextPriceType,
//         price_value: nextPriceValue,
//       };
//     });
//   };

//   // Price type change: convert value
//   const handlePriceTypeChange = (newType) => {
//     setPurchaseFormData((prev) => {
//       if (prev.price_type === newType) return prev;

//       let nextValue = prev.price_value;
//       const v = Number(prev.price_value || 0);

//       if (
//         packSizeKg > 0 &&
//         String(prev.price_value || "").trim() !== "" &&
//         v > 0
//       ) {
//         if (prev.price_type === "per_kg" && newType === "per_sack") {
//           nextValue = v * packSizeKg;
//         } else if (prev.price_type === "per_sack" && newType === "per_kg") {
//           nextValue = v / packSizeKg;
//         }
//       } else {
//         const basePerKg = Number(selectedFeedType?.current_price_per_kg || 0);
//         if (newType === "per_kg") nextValue = basePerKg || "";
//         if (newType === "per_sack" && packSizeKg > 0) {
//           nextValue = basePerKg ? basePerKg * packSizeKg : "";
//         }
//       }

//       return { ...prev, price_type: newType, price_value: nextValue };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!purchaseFormData.feed_type_id || !purchaseFormData.qty_value) {
//       setPurchaseError("Please fill in all required fields.");
//       return;
//     }

//     if (purchaseFormData.qty_unit === "sacks" && (!packSizeKg || packSizeKg <= 0)) {
//       setPurchaseError("Selected feed type has no pack size; cannot use sacks.");
//       return;
//     }

//     setAddingPurchase(true);
//     setPurchaseError("");

//     try {
//       const params = {
//         feed_type_id: parseInt(purchaseFormData.feed_type_id, 10),
//         purchased_at: purchaseFormData.purchased_date?.format?.("YYYY-MM-DD") ?? null,
//         qty_kg:
//           purchaseFormData.qty_unit === "sacks"
//             ? Number(purchaseFormData.qty_value) * packSizeKg
//             : Number(purchaseFormData.qty_value),
//       };

//       const priceStr = String(purchaseFormData.price_value || "").trim();
//       if (priceStr !== "") {
//         const priceNum = Number(priceStr);
//         if (purchaseFormData.price_type === "per_kg") {
//           params.unit_price_per_kg = priceNum;
//         } else {
//           params.price_per_sack = priceNum;
//         }
//       }

//       await addFeedPurchaseForCoop(params);

//       onSuccess?.();
//       resetForm();
//       onClose?.();
//     } catch (err) {
//       console.error(err);
//       setPurchaseError(err.message || "Failed to add purchase. Please try again.");
//     } finally {
//       setAddingPurchase(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <div
//         onMouseDown={(e) => {
//           if (e.target === e.currentTarget && !addingPurchase) handleClose();
//         }}
//         className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
//         aria-modal="true"
//         role="dialog"
//       >
//         <div className="w-[500px] max-w-[95vw] rounded-2xl bg-white shadow-xl">
//           <div className="p-6">
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-[#F6C32B]">Add New Purchase</h2>
//               <p className="text-sm text-gray-600 mt-1">
//                 Record a new feed purchase for allocation
//               </p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Feed Type */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">
//                   Feed Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={purchaseFormData.feed_type_id}
//                   onChange={(e) => handleFeedTypeChange(e.target.value)}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                   disabled={addingPurchase}
//                   required
//                 >
//                   <option value="">Select feed type</option>
//                   {feedTypes.map((feed) => (
//                     <option key={feed.feed_type_id} value={feed.feed_type_id}>
//                       {feed.name} {feed.brand ? `- ${feed.brand}` : ""}{" "}
//                       {feed.form ? `(${feed.form})` : ""}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Pack Size */}
//               {packSizeKg > 0 && (
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">
//                     Pack Size
//                   </label>
//                   <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
//                     {packSizeKg} kg / sack
//                   </div>
//                 </div>
//               )}

//               {/* Quantity */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">
//                   Quantity <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={purchaseFormData.qty_value}
//                     onChange={(e) =>
//                       setPurchaseFormData((prev) => ({
//                         ...prev,
//                         qty_value: e.target.value,
//                       }))
//                     }
//                     placeholder="e.g., 1000"
//                     className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                     disabled={addingPurchase}
//                     required
//                   />
//                   <select
//                     value={purchaseFormData.qty_unit}
//                     onChange={(e) => handleQtyUnitChange(e.target.value)}
//                     className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                     disabled={addingPurchase}
//                   >
//                     <option value="kg">kg</option>
//                     {packSizeKg > 0 && <option value="sacks">sacks</option>}
//                   </select>
//                 </div>

//                 {purchaseFormData.qty_unit === "sacks" && packSizeKg > 0 && qtyValueNum > 0 && (
//                   <p className="text-sm text-gray-600 mt-1">
//                     Total KG: <span className="font-semibold">{qtyKg.toFixed(2)}</span> kg
//                   </p>
//                 )}
//               </div>

//               {/* Price */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">
//                   Price <span className="text-gray-400 text-xs">(auto-filled, editable)</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={purchaseFormData.price_value}
//                     onChange={(e) =>
//                       setPurchaseFormData((prev) => ({
//                         ...prev,
//                         price_value: e.target.value,
//                       }))
//                     }
//                     placeholder="Uses feed type price if empty"
//                     className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                     disabled={addingPurchase}
//                   />
//                   <select
//                     value={purchaseFormData.price_type}
//                     onChange={(e) => handlePriceTypeChange(e.target.value)}
//                     className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                     disabled={addingPurchase}
//                   >
//                     <option value="per_kg">per kg</option>
//                     {packSizeKg > 0 && <option value="per_sack">per sack</option>}
//                   </select>
//                 </div>

//                 {packSizeKg > 0 && priceValueNum > 0 && (
//                   <p className="text-sm text-gray-600 mt-1">
//                     {purchaseFormData.price_type === "per_kg"
//                       ? `≈ ₱${pricePerSack.toFixed(2)} per sack`
//                       : `≈ ₱${unitPricePerKg.toFixed(2)} per kg`}
//                   </p>
//                 )}

//                 {showHighPriceWarning && (
//                   <p className="text-sm text-red-600 mt-1">
//                     This price looks unusually high. Double-check per kg vs per sack.
//                   </p>
//                 )}
//               </div>

//               {/* Total */}
//               {qtyKg > 0 && unitPricePerKg > 0 && (
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-1">
//                     Total Amount
//                   </label>
//                   <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-semibold">
//                     ₱
//                     {totalAmount.toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Date */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-1">
//                   Purchase Date <span className="text-red-500">*</span>
//                 </label>
//                 <DatePicker
//                   value={purchaseFormData.purchased_date}
//                   onChange={(newValue) =>
//                     setPurchaseFormData((prev) => ({
//                       ...prev,
//                       purchased_date: newValue,
//                     }))
//                   }
//                   disabled={addingPurchase}
//                   slotProps={{
//                     textField: {
//                       className: "w-full",
//                       sx: {
//                         "& .MuiOutlinedInput-root": {
//                           "&:hover fieldset": { borderColor: "#F6C32B" },
//                           "&.Mui-focused fieldset": { borderColor: "#F6C32B" },
//                         },
//                       },
//                     },
//                   }}
//                 />
//               </div>

//               {purchaseError && (
//                 <div className="p-3 rounded-lg bg-red-50 border border-red-200">
//                   <p className="text-sm text-red-600">{purchaseError}</p>
//                 </div>
//               )}

//               {/* Buttons */}
//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={handleClose}
//                   disabled={addingPurchase}
//                   className="flex-1 h-11 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={
//                     addingPurchase ||
//                     !purchaseFormData.feed_type_id ||
//                     !purchaseFormData.qty_value
//                   }
//                   className={`flex-1 h-11 rounded-lg font-semibold transition-all ${
//                     addingPurchase ||
//                     !purchaseFormData.feed_type_id ||
//                     !purchaseFormData.qty_value
//                       ? "bg-yellow-300 text-white cursor-not-allowed"
//                       : "bg-[#F6C32B] text-white hover:opacity-90 hover:shadow-lg"
//                   }`}
//                 >
//                   {addingPurchase ? "Adding..." : "Add Purchase"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </LocalizationProvider>
//   );
// }
