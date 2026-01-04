import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IoAdd } from "react-icons/io5";

import FeedAllocationList from "@/components/admin/tables/FeedAllocationList";
import FarmersAllocation from "@/components/admin/tables/FarmersAllocation";
import FeedMonitoringTable from "@/components/admin/tables/FeedMonitoringTable";
import FeedEntryTable from "@/components/admin/tables/FeedEntryTable";
import { addFeedTypeForCoop, updateFeedTypeForCoop } from "../../../services/FeedEntry";

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

export default function FeedEntry() {
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedFarmers, setSelectedFarmers] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [addFeedModalOpen, setAddFeedModalOpen] = useState(false);
  const [editFeedModalOpen, setEditFeedModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [addingFeed, setAddingFeed] = useState(false);
  const [updatingFeed, setUpdatingFeed] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state for Add Feed
  const [feedFormData, setFeedFormData] = useState({
    name: "",
    brand: "",
    form: "",
    current_price_per_kg: "",
    pack_size_kg: "",
  });

  // Form state for Edit Feed
  const [editFormData, setEditFormData] = useState({
    name: "",
    brand: "",
    form: "",
    current_price_per_kg: "",
    pack_size_kg: "",
  });

  const handleEditFeed = (feed) => {
    setEditingFeed(feed);
    setEditFormData({
      name: feed.name || "",
      brand: feed.brand || "",
      form: feed.form || "",
      current_price_per_kg: feed.current_price_per_kg || "",
      pack_size_kg: feed.pack_size_kg || "",
    });
    setEditFeedModalOpen(true);
  };

  const handleUpdateFeedSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.name.trim()) {
      setFeedError("Feed name is required");
      return;
    }

    setUpdatingFeed(true);
    setFeedError("");

    try {
      const row = await updateFeedTypeForCoop({
        feed_type_id: editingFeed.feed_type_id,
        name: editFormData.name,
        brand: editFormData.brand,
        form: editFormData.form,
        current_price_per_kg: editFormData.current_price_per_kg ? parseFloat(editFormData.current_price_per_kg) : null,
        pack_size_kg: editFormData.pack_size_kg ? parseFloat(editFormData.pack_size_kg) : null,
      });

      alert(`Feed type "${row?.name || editFormData.name}" updated successfully!`);
      setEditFormData({ name: "", brand: "", form: "", current_price_per_kg: "", pack_size_kg: "" });
      setEditFeedModalOpen(false);
      setEditingFeed(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to update feed type:", err);
      setFeedError(err.message || "Failed to update feed type. Please try again.");
    } finally {
      setUpdatingFeed(false);
    }
  };

  const handleCloseEditFeedModal = () => {
    if (updatingFeed) return;
    setEditFormData({ name: "", brand: "", form: "", current_price_per_kg: "", pack_size_kg: "" });
    setFeedError("");
    setEditFeedModalOpen(false);
    setEditingFeed(null);
  };

  const handleAddFeedSubmit = async (e) => {
    e.preventDefault();

    if (!feedFormData.name.trim()) {
      setFeedError("Feed name is required");
      return;
    }

    setAddingFeed(true);
    setFeedError("");

    try {
      const row = await addFeedTypeForCoop({
        name: feedFormData.name,
        brand: feedFormData.brand,
        form: feedFormData.form,
        current_price_per_kg: feedFormData.current_price_per_kg ? parseFloat(feedFormData.current_price_per_kg) : null,
        pack_size_kg: feedFormData.pack_size_kg ? parseFloat(feedFormData.pack_size_kg) : null,
      });

      alert(`Feed type "${row?.name || feedFormData.name}" added successfully!`);
      setFeedFormData({ name: "", brand: "", form: "", current_price_per_kg: "", pack_size_kg: "" });
      setAddFeedModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to add feed type:", err);
      setFeedError(err.message || "Failed to add feed type. Please try again.");
    } finally {
      setAddingFeed(false);
    }
  };

  const handleCloseAddFeedModal = () => {
    if (addingFeed) return;
    setFeedFormData({ name: "", brand: "", form: "", current_price_per_kg: "", pack_size_kg: "" });
    setFeedError("");
    setAddFeedModalOpen(false);
  };

  const canAllocate = selectedFarmers.size > 0 && selectedPurchase !== null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="w-full space-y-5">
        {/* Feed Types Table */}
        <FeedEntryTable
          refreshKey={refreshKey}
          onAddClick={() => setAddFeedModalOpen(true)}
          onEditClick={handleEditFeed}
        />

        {/* Add Feed Modal */}
        {addFeedModalOpen && (
          <div
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !addingFeed) handleCloseAddFeedModal();
            }}
            className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div className="w-[500px] max-w-[95vw] rounded-2xl bg-white shadow-xl">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#F6C32B]">Add New Feed Type</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Register a new feed type for your cooperative
                  </p>
                </div>

                <form onSubmit={handleAddFeedSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Feed Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={feedFormData.name}
                      onChange={(e) =>
                        setFeedFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., Grower 6-14w, Layer High-Calcium"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={addingFeed}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Brand <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={feedFormData.brand}
                      onChange={(e) =>
                        setFeedFormData((prev) => ({ ...prev, brand: e.target.value }))
                      }
                      placeholder="e.g., Pilmico, Unifeeds, B-MEG"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={addingFeed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Form <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <select
                      value={feedFormData.form}
                      onChange={(e) =>
                        setFeedFormData((prev) => ({ ...prev, form: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={addingFeed}
                    >
                      <option value="">Select form</option>
                      <option value="pellet">Pellet</option>
                      <option value="crumble">Crumble</option>
                      <option value="mash">Mash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Current Price per Kg <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={feedFormData.current_price_per_kg}
                      onChange={(e) =>
                        setFeedFormData((prev) => ({ ...prev, current_price_per_kg: e.target.value }))
                      }
                      placeholder="e.g., 45.50"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={addingFeed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Pack Size (Kg per sack/bag) <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={feedFormData.pack_size_kg}
                      onChange={(e) =>
                        setFeedFormData((prev) => ({ ...prev, pack_size_kg: e.target.value }))
                      }
                      placeholder="e.g., 25, 50"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={addingFeed}
                    />
                  </div>

                  {feedError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{feedError}</p>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Duplicate feed types (same name, brand, and form) will not be added again.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseAddFeedModal}
                      disabled={addingFeed}
                      className="flex-1 h-11 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingFeed || !feedFormData.name.trim()}
                      className={`flex-1 h-11 rounded-lg font-semibold transition-all ${
                        addingFeed || !feedFormData.name.trim()
                          ? "bg-yellow-300 text-white cursor-not-allowed"
                          : "bg-[#F6C32B] text-white hover:opacity-90 hover:shadow-lg"
                      }`}
                    >
                      {addingFeed ? "Adding..." : "Add Feed Type"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Feed Modal */}
        {editFeedModalOpen && (
          <div
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !updatingFeed) handleCloseEditFeedModal();
            }}
            className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div className="w-[500px] max-w-[95vw] rounded-2xl bg-white shadow-xl">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#F6C32B]">Edit Feed Type</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Update feed type information
                  </p>
                </div>

                <form onSubmit={handleUpdateFeedSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Feed Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., Grower 6-14w, Layer High-Calcium"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={updatingFeed}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Brand <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.brand}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, brand: e.target.value }))
                      }
                      placeholder="e.g., Pilmico, Unifeeds, B-MEG"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={updatingFeed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Form <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <select
                      value={editFormData.form}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, form: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={updatingFeed}
                    >
                      <option value="">Select form</option>
                      <option value="pellet">Pellet</option>
                      <option value="crumble">Crumble</option>
                      <option value="mash">Mash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Current Price per Kg <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.current_price_per_kg}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, current_price_per_kg: e.target.value }))
                      }
                      placeholder="e.g., 45.50"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={updatingFeed}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Pack Size (Kg per sack/bag) <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.pack_size_kg}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, pack_size_kg: e.target.value }))
                      }
                      placeholder="e.g., 25, 50"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6C32B] focus:border-transparent"
                      disabled={updatingFeed}
                    />
                  </div>

                  {feedError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{feedError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseEditFeedModal}
                      disabled={updatingFeed}
                      className="flex-1 h-11 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingFeed || !editFormData.name.trim()}
                      className={`flex-1 h-11 rounded-lg font-semibold transition-all ${
                        updatingFeed || !editFormData.name.trim()
                          ? "bg-yellow-300 text-white cursor-not-allowed"
                          : "bg-[#F6C32B] text-white hover:opacity-90 hover:shadow-lg"
                      }`}
                    >
                      {updatingFeed ? "Updating..." : "Update Feed Type"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}