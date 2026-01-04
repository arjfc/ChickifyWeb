// FeedMonitoring.jsx
import React, { useState } from "react";
import FeedAllocationList from "@/components/admin/tables/FeedAllocationList";
import FarmersAllocation from "@/components/admin/tables/FarmersAllocation";
import FeedMonitoringTable from "@/components/admin/tables/FeedMonitoringTable";
import AddFeedPurchaseModal from "@/components/admin/modals/AddFeedPurchaseModal";
import { supabase } from "@/lib/supabase";

function SelectionSummary({ farmersCount, purchase }) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-[#F6C32B] p-3 shadow-sm">
      <div className="flex items-center gap-6 text-[15px]">
        <div className="flex items-center gap-2">
          {farmersCount > 0 ? (
            <>
              <span className="text-green-600 text-[20px]">✓</span>
              <span className="font-semibold text-green-700">
                {farmersCount} Farmer{farmersCount !== 1 ? "s" : ""} Selected
              </span>
            </>
          ) : (
            <>
              <span className="text-gray-400 text-[20px]">○</span>
              <span className="text-gray-500">No Farmers Selected</span>
            </>
          )}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        <div className="flex items-center gap-2">
          {purchase ? (
            <>
              <span className="text-green-600 text-[20px]">✓</span>
              <span className="font-semibold text-green-700">
                {purchase.name} ({purchase.amountKg} kg)
              </span>
            </>
          ) : (
            <>
              <span className="text-gray-400 text-[20px]">○</span>
              <span className="text-gray-500">No Feed Selected</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedMonitoring() {
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedFarmers, setSelectedFarmers] = useState(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [addPurchaseModalOpen, setAddPurchaseModalOpen] = useState(false);
  const [editPurchaseModalOpen, setEditPurchaseModalOpen] = useState(false);
  const [editPurchaseData, setEditPurchaseData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditPurchase = async (feedTypeData) => {
    try {
      // Fetch individual purchases for this feed type
      const { fetchFeedPurchasesByType } = await import("../../../services/FeedPurchase");
      const purchases = await fetchFeedPurchasesByType(feedTypeData.feed_type_id);
      
      // Check if any purchase has allocations
      const hasAnyAllocations = purchases.some(p => p.has_allocations);
      
      if (hasAnyAllocations) {
        // amazonq-ignore-next-line
        alert("Cannot edit this feed type because it has existing allocations.");
        return;
      }
      
      setEditPurchaseData({
        feedType: feedTypeData,
        purchases: purchases
      });
      setEditPurchaseModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch purchases for editing:", error);
      alert("Failed to load purchase data for editing.");
    }
  };

  const handleConfirmAllocate = async ({ purchaseId, allocations }) => {
    try {
      setSubmitting(true);

      const { data, error } = await supabase.rpc("allocate_feed_to_farmers", {
        p_purchase_id: purchaseId,
        p_allocations: allocations.map((a) => ({
          farmer_id: a.farmerId,
          kg: a.kg,
        })),
      });

      if (error) throw error;

      // amazonq-ignore-next-line
      console.log("Feed allocation result:", data);
      setRefreshKey((k) => k + 1);

      setSelectedFarmers(new Set());
      setSelectedPurchase(null);
      setModalOpen(false);
    } catch (e) {
      alert(e.message || "Failed to allocate feed.");
    } finally {
      setSubmitting(false);
    }
  };

  const canAllocate = selectedFarmers.size > 0 && selectedPurchase !== null;

  return (
    <div className="w-full space-y-5">
      <FeedAllocationList
        selectedPurchaseId={selectedPurchase?.id}
        onSelectPurchase={setSelectedPurchase}
        onAddPurchase={() => setAddPurchaseModalOpen(true)}
        onEditPurchase={handleEditPurchase}
        refreshKey={refreshKey}
      />

      <SelectionSummary
        farmersCount={selectedFarmers.size}
        purchase={selectedPurchase}
      />

      <FarmersAllocation
        selectedFarmers={selectedFarmers}
        onSelectFarmers={setSelectedFarmers}
        modalOpen={modalOpen}
        onOpenModal={() => setModalOpen(true)}
        onCloseModal={() => setModalOpen(false)}
        onConfirmAllocate={handleConfirmAllocate}
        selectedPurchase={selectedPurchase}
        refreshKey={refreshKey}
        submitting={submitting}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={!canAllocate || submitting}
          className={`h-12 px-8 rounded-xl text-white text-[16px] font-semibold transition-all ${
            !canAllocate || submitting
              ? "bg-yellow-300 cursor-not-allowed"
              : "bg-[#F6C32B] hover:opacity-90 hover:shadow-lg"
          }`}
        >
          {submitting
            ? "Allocating..."
            : selectedFarmers.size > 0
            ? `Allocate Feed to ${selectedFarmers.size} Farmer${
                selectedFarmers.size !== 1 ? "s" : ""
              }`
            : "Allocate Feed"}
        </button>
      </div>

      <FeedMonitoringTable refreshKey={refreshKey} />

      {/* Add Purchase Modal */}
      <AddFeedPurchaseModal
        open={addPurchaseModalOpen}
        onClose={() => setAddPurchaseModalOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {/* Edit Purchase Modal */}
      <AddFeedPurchaseModal
        open={editPurchaseModalOpen}
        onClose={() => {
          setEditPurchaseModalOpen(false);
          setEditPurchaseData(null);
        }}
        onSuccess={() => {
          setRefreshKey((k) => k + 1);
          setEditPurchaseModalOpen(false);
          setEditPurchaseData(null);
        }}
        editMode={true}
        editData={editPurchaseData}
      />
    </div>
  );
}

// amazonq-ignore-next-line
// import React, { useState, useEffect } from "react";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import dayjs from "dayjs";

// import FeedAllocationList from "@/components/admin/tables/FeedAllocationList";
// import FarmersAllocation from "@/components/admin/tables/FarmersAllocation";
// import FeedMonitoringTable from "@/components/admin/tables/FeedMonitoringTable";
// import { supabase } from "@/lib/supabase";
// import { listMyFeedTypes } from "../../../services/FeedEntry";
// import { addFeedPurchaseForCoop } from "../../../services/FeedPurchase";

// function SelectionSummary({ farmersCount, purchase }) {
//   return (
//     <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-[#F6C32B] p-3 shadow-sm">
//       <div className="flex items-center gap-6 text-[15px]">
//         <div className="flex items-center gap-2">
//           {farmersCount > 0 ? (
//             <>
//               <span className="text-green-600 text-[20px]">✓</span>
//               <span className="font-semibold text-green-700">
//                 {farmersCount} Farmer{farmersCount !== 1 ? 's' : ''} Selected
//               </span>
//             </>
//           ) : (
//             <>
//               <span className="text-gray-400 text-[20px]">○</span>
//               <span className="text-gray-500">No Farmers Selected</span>
//             </>
//           )}
//         </div>

//         <div className="w-px h-8 bg-gray-300" />

//         <div className="flex items-center gap-2">
//           {purchase ? (
//             <>
//               <span className="text-green-600 text-[20px]">✓</span>
//               <span className="font-semibold text-green-700">
//                 {purchase.name} ({purchase.amountKg} kg)
//               </span>
//             </>
//           ) : (
//             <>
//               <span className="text-gray-400 text-[20px]">○</span>
//               <span className="text-gray-500">No Feed Selected</span>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function FeedMonitoring() {
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [selectedFarmers, setSelectedFarmers] = useState(new Set());
//   const [modalOpen, setModalOpen] = useState(false);
//   const [addPurchaseModalOpen, setAddPurchaseModalOpen] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [addingPurchase, setAddingPurchase] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [feedTypes, setFeedTypes] = useState([]);
//   const [purchaseError, setPurchaseError] = useState("");

//   // Form state for Add Purchase
//   const [purchaseFormData, setPurchaseFormData] = useState({
//     feed_type_id: "",
//     qty_value: "",
//     qty_unit: "kg", // "kg" or "sacks"
//     price_value: "",
//     price_type: "per_kg", // "per_kg" or "per_sack"
//     purchased_date: dayjs(),
//   });
//   const [selectedFeedType, setSelectedFeedType] = useState(null);

//   useEffect(() => {
//     const loadFeedTypes = async () => {
//       try {
//         const data = await listMyFeedTypes();
//         setFeedTypes(data);
//       } catch (err) {
//         console.error("Failed to load feed types:", err);
//       }
//     };
//     loadFeedTypes();
//   }, []);

//   // Auto-fill unit price when feed type changes
//   const handleFeedTypeChange = (feedTypeId) => {
//     setPurchaseFormData((prev) => ({ ...prev, feed_type_id: feedTypeId }));
    
//     if (feedTypeId) {
//       const selectedFeed = feedTypes.find(f => f.feed_type_id === parseInt(feedTypeId));
//       setSelectedFeedType(selectedFeed);
//       if (selectedFeed && selectedFeed.current_price_per_kg) {
//         setPurchaseFormData((prev) => ({ 
//           ...prev, 
//           price_value: selectedFeed.current_price_per_kg,
//           price_type: "per_kg"
//         }));
//       }
//     } else {
//       setSelectedFeedType(null);
//       setPurchaseFormData((prev) => ({ ...prev, price_value: "" }));
//     }
//   };

//   // Calculate derived values
//   const qtyKg = purchaseFormData.qty_unit === "sacks" && selectedFeedType?.pack_size_kg
//     ? parseFloat(purchaseFormData.qty_value || 0) * selectedFeedType.pack_size_kg
//     : parseFloat(purchaseFormData.qty_value || 0);

//   const priceValue = parseFloat(purchaseFormData.price_value || 0);
//   const unitPricePerKg = purchaseFormData.price_type === "per_sack" && selectedFeedType?.pack_size_kg
//     ? priceValue / selectedFeedType.pack_size_kg
//     : priceValue;
//   const pricePerSack = purchaseFormData.price_type === "per_kg" && selectedFeedType?.pack_size_kg
//     ? priceValue * selectedFeedType.pack_size_kg
//     : priceValue;
//   const totalAmount = qtyKg * unitPricePerKg;

//   const handleConfirmAllocate = async ({ purchaseId, allocations }) => {
//     try {
//       setSubmitting(true);

//       const { data, error } = await supabase.rpc("allocate_feed_to_farmers", {
//         p_purchase_id: purchaseId,
//         p_allocations: allocations.map(a => ({
//           farmer_id: a.farmerId,
//           kg: a.kg,
//         })),
//       });

//       if (error) throw error;

//       console.log("Feed allocation result:", data);
//       setRefreshKey((k) => k + 1);

//       setSelectedFarmers(new Set());
//       setSelectedPurchase(null);
//       setModalOpen(false);
//     } catch (e) {
//       alert(e.message || "Failed to allocate feed.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//     const handleQtyUnitChange = (unit) => {
//     setPurchaseFormData((prev) => {
//       const nextPriceType = unit === "sacks" ? "per_sack" : "per_kg";

//       let nextPriceValue = prev.price_value;
//       const v = Number(prev.price_value || 0);

//       // Convert existing price value if present and pack size exists
//       if (String(prev.price_value || "").trim() !== "" && packSizeKg > 0 && v > 0) {
//         if (prev.price_type === "per_kg" && nextPriceType === "per_sack") {
//           nextPriceValue = v * packSizeKg;
//         } else if (prev.price_type === "per_sack" && nextPriceType === "per_kg") {
//           nextPriceValue = v / packSizeKg;
//         }
//       } else {
//         // If empty, use feed type default
//         const basePerKg = Number(selectedFeedType?.current_price_per_kg || 0);
//         if (nextPriceType === "per_kg") nextPriceValue = basePerKg || "";
//         if (nextPriceType === "per_sack" && packSizeKg > 0)
//           nextPriceValue = basePerKg ? basePerKg * packSizeKg : "";
//       }

//       return {
//         ...prev,
//         qty_unit: unit,
//         price_type: nextPriceType,
//         price_value: nextPriceValue,
//       };
//     });
//   };

//     const handlePriceTypeChange = (newType) => {
//     setPurchaseFormData((prev) => {
//       if (prev.price_type === newType) return prev;

//       let nextValue = prev.price_value;
//       const v = Number(prev.price_value || 0);

//       if (packSizeKg > 0 && String(prev.price_value || "").trim() !== "" && v > 0) {
//         if (prev.price_type === "per_kg" && newType === "per_sack") {
//           nextValue = v * packSizeKg;
//         } else if (prev.price_type === "per_sack" && newType === "per_kg") {
//           nextValue = v / packSizeKg;
//         }
//       } else {
//         const basePerKg = Number(selectedFeedType?.current_price_per_kg || 0);
//         if (newType === "per_kg") nextValue = basePerKg || "";
//         if (newType === "per_sack" && packSizeKg > 0)
//           nextValue = basePerKg ? basePerKg * packSizeKg : "";
//       }

//       return { ...prev, price_type: newType, price_value: nextValue };
//     });
//   };

//   const handleAddPurchaseSubmit = async (e) => {
//     e.preventDefault();

//     if (!purchaseFormData.feed_type_id || !purchaseFormData.qty_value) {
//       setPurchaseError("Please fill in all required fields");
//       return;
//     }

//     // sacks guard
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

//       // price mapping (never send both)
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

//       alert("Feed purchase added successfully!");
//       resetPurchaseForm();
//       setAddPurchaseModalOpen(false);
//       setRefreshKey((k) => k + 1);
//     } catch (err) {
//       console.error("Failed to add purchase:", err);
//       setPurchaseError(err.message || "Failed to add purchase. Please try again.");
//     } finally {
//       setAddingPurchase(false);
//     }
//   };

//   const handleCloseAddPurchaseModal = () => {
//     if (addingPurchase) return;
//     setPurchaseFormData({
//       feed_type_id: "",
//       qty_value: "",
//       qty_unit: "kg",
//       price_value: "",
//       price_type: "per_kg",
//       purchased_date: dayjs(),
//     });
//     setSelectedFeedType(null);
//     setPurchaseError("");
//     setAddPurchaseModalOpen(false);
//   };

//   const handleAddPurchase = () => {
//     setAddPurchaseModalOpen(true);
//   };

//   const canAllocate = selectedFarmers.size > 0 && selectedPurchase !== null;

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <div className="w-full space-y-5">
        
//         <FeedAllocationList
//           selectedPurchaseId={selectedPurchase?.id}
//           onSelectPurchase={setSelectedPurchase}
//           onAddPurchase={handleAddPurchase}
//           refreshKey={refreshKey}
//         />

//         <SelectionSummary 
//           farmersCount={selectedFarmers.size}
//           purchase={selectedPurchase}
//         />

//         <FarmersAllocation
//           selectedFarmers={selectedFarmers}
//           onSelectFarmers={setSelectedFarmers}
//           modalOpen={modalOpen}
//           onOpenModal={() => setModalOpen(true)}
//           onCloseModal={() => setModalOpen(false)}
//           onConfirmAllocate={handleConfirmAllocate}
//           selectedPurchase={selectedPurchase}
//           refreshKey={refreshKey}
//           submitting={submitting}
//         />

//         <div className="flex justify-end">
//           <button
//             type="button"
//             onClick={() => setModalOpen(true)}
//             disabled={!canAllocate || submitting}
//             className={`h-12 px-8 rounded-xl text-white text-[16px] font-semibold transition-all ${
//               !canAllocate || submitting
//                 ? "bg-yellow-300 cursor-not-allowed"
//                 : "bg-[#F6C32B] hover:opacity-90 hover:shadow-lg"
//             }`}
//           >
//             {submitting ? 'Allocating...' : 
//              selectedFarmers.size > 0 
//               ? `Allocate Feed to ${selectedFarmers.size} Farmer${selectedFarmers.size !== 1 ? 's' : ''}`
//               : 'Allocate Feed'
//             }
//           </button>
//         </div>

//         <FeedMonitoringTable refreshKey={refreshKey} />

//         {/* Add Purchase Modal */}
//         {addPurchaseModalOpen && (
//           <div
//             onMouseDown={(e) => {
//               if (e.target === e.currentTarget && !addingPurchase) handleCloseAddPurchaseModal();
//             }}
//             className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
//             aria-modal="true"
//             role="dialog"
//           >
//             <div className="w-[500px] max-w-[95vw] rounded-2xl bg-white shadow-xl">
//               <div className="p-6">
//                 <div className="text-center mb-6">
//                   <h2 className="text-2xl font-bold text-[#F6C32B]">Add New Purchase</h2>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Record a new feed purchase for allocation
//                   </p>
//                 </div>

//                 <form onSubmit={handleAddPurchaseSubmit} className="space-y-4">
//                   {/* Feed Type */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-1">
//                       Feed Type <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={purchaseFormData.feed_type_id}
//                       onChange={(e) => handleFeedTypeChange(e.target.value)}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                       disabled={addingPurchase}
//                       required
//                     >
//                       <option value="">Select feed type</option>
//                       {feedTypes.map((feed) => (
//                         <option key={feed.feed_type_id} value={feed.feed_type_id}>
//                           {feed.name} {feed.brand ? `- ${feed.brand}` : ""}{" "}
//                           {feed.form ? `(${feed.form})` : ""}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Pack Size */}
//                   {packSizeKg > 0 && (
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-1">
//                         Pack Size
//                       </label>
//                       <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
//                         {packSizeKg} kg / sack
//                       </div>
//                     </div>
//                   )}

//                   {/* Quantity + Unit */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-1">
//                       Quantity <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={purchaseFormData.qty_value}
//                         onChange={(e) =>
//                           setPurchaseFormData((prev) => ({ ...prev, qty_value: e.target.value }))
//                         }
//                         placeholder="e.g., 1000"
//                         className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                         disabled={addingPurchase}
//                         required
//                       />
//                       <select
//                         value={purchaseFormData.qty_unit}
//                         onChange={(e) => handleQtyUnitChange(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                         disabled={addingPurchase}
//                       >
//                         <option value="kg">kg</option>
//                         {packSizeKg > 0 && <option value="sacks">sacks</option>}
//                       </select>
//                     </div>

//                     {purchaseFormData.qty_unit === "sacks" && packSizeKg > 0 && qtyValueNum > 0 && (
//                       <p className="text-sm text-gray-600 mt-1">
//                         Total KG: <span className="font-semibold">{qtyKg.toFixed(2)}</span> kg
//                       </p>
//                     )}
//                   </div>

//                   {/* Price + Type */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-1">
//                       Price <span className="text-gray-400 text-xs">(auto-filled, editable)</span>
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={purchaseFormData.price_value}
//                         onChange={(e) =>
//                           setPurchaseFormData((prev) => ({ ...prev, price_value: e.target.value }))
//                         }
//                         placeholder="Uses feed type price if empty"
//                         className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                         disabled={addingPurchase}
//                       />
//                       <select
//                         value={purchaseFormData.price_type}
//                         onChange={(e) => handlePriceTypeChange(e.target.value)}
//                         className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
//                         disabled={addingPurchase}
//                       >
//                         <option value="per_kg">per kg</option>
//                         {packSizeKg > 0 && <option value="per_sack">per sack</option>}
//                       </select>
//                     </div>

//                     {packSizeKg > 0 && priceValueNum > 0 && (
//                       <p className="text-sm text-gray-600 mt-1">
//                         {purchaseFormData.price_type === "per_kg"
//                           ? `≈ ₱${pricePerSack.toFixed(2)} per sack`
//                           : `≈ ₱${unitPricePerKg.toFixed(2)} per kg`}
//                       </p>
//                     )}

//                     {showHighPriceWarning && (
//                       <p className="text-sm text-red-600 mt-1">
//                         This price looks unusually high. Double-check per kg vs per sack.
//                       </p>
//                     )}
//                   </div>

//                   {/* Total Amount */}
//                   {qtyKg > 0 && unitPricePerKg > 0 && (
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-1">
//                         Total Amount
//                       </label>
//                       <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-semibold">
//                         ₱
//                         {totalAmount.toLocaleString("en-US", {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                       </div>
//                     </div>
//                   )}

//                   {/* Purchase Date */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-1">
//                       Purchase Date <span className="text-red-500">*</span>
//                     </label>
//                     <DatePicker
//                       value={purchaseFormData.purchased_date}
//                       onChange={(newValue) =>
//                         setPurchaseFormData((prev) => ({ ...prev, purchased_date: newValue }))
//                       }
//                       disabled={addingPurchase}
//                       slotProps={{
//                         textField: {
//                           className: "w-full",
//                           sx: {
//                             "& .MuiOutlinedInput-root": {
//                               "&:hover fieldset": { borderColor: "#F6C32B" },
//                               "&.Mui-focused fieldset": { borderColor: "#F6C32B" },
//                             },
//                           },
//                         },
//                       }}
//                     />
//                   </div>

//                   {/* Error */}
//                   {purchaseError && (
//                     <div className="p-3 rounded-lg bg-red-50 border border-red-200">
//                       <p className="text-sm text-red-600">{purchaseError}</p>
//                     </div>
//                   )}

//                   {/* Buttons */}
//                   <div className="flex gap-3 pt-2">
//                     <button
//                       type="button"
//                       onClick={handleCloseAddPurchaseModal}
//                       disabled={addingPurchase}
//                       className="flex-1 h-11 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={
//                         addingPurchase || !purchaseFormData.feed_type_id || !purchaseFormData.qty_value
//                       }
//                       className={`flex-1 h-11 rounded-lg font-semibold transition-all ${
//                         addingPurchase || !purchaseFormData.feed_type_id || !purchaseFormData.qty_value
//                           ? "bg-yellow-300 text-white cursor-not-allowed"
//                           : "bg-[#F6C32B] text-white hover:opacity-90 hover:shadow-lg"
//                       }`}
//                     >
//                       {addingPurchase ? "Adding..." : "Add Purchase"}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </LocalizationProvider>
//   );
// }