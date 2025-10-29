import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import FeedAllocationList from "@/components/admin/tables/FeedAllocationList";
import FarmersAllocation from "@/components/admin/tables/FarmersAllocation";
import FeedMonitoringTable from "@/components/admin/tables/FeedMonitoringTable";
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
                {farmersCount} Farmer{farmersCount !== 1 ? 's' : ''} Selected
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
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConfirmAllocate = async ({ purchaseId, allocations }) => {
    try {
      setSubmitting(true);

      const { data, error } = await supabase.rpc("allocate_feed_to_farmers", {
        p_purchase_id: purchaseId,
        p_allocations: allocations.map(a => ({
          farmer_id: a.farmerId,
          kg: a.kg,
        })),
      });

      if (error) throw error;

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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="w-full space-y-5">
        
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

        <SelectionSummary 
          farmersCount={selectedFarmers.size}
          purchase={selectedPurchase}
        />

        <FeedAllocationList
          selectedPurchaseId={selectedPurchase?.id}
          onSelectPurchase={setSelectedPurchase}
          refreshKey={refreshKey}
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
            {submitting ? 'Allocating...' : 
             selectedFarmers.size > 0 
              ? `Allocate Feed to ${selectedFarmers.size} Farmer${selectedFarmers.size !== 1 ? 's' : ''}`
              : 'Allocate Feed'
            }
          </button>
        </div>

        <FeedMonitoringTable refreshKey={refreshKey} />
      </div>
    </LocalizationProvider>
  );
}