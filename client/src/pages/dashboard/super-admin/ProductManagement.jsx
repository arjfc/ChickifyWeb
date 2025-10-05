// client/src/pages/super-admin/ProductManagement.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import ProductTable from "../../../components/super-admin/tables/ProductTable";
// ❌ removed backend import
// import { createProduct, updateProduct } from "../../../api/product";

Modal.setAppElement("#root");

// Bigger modal, no page scroll
const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "min(1200px, 95vw)",
    maxHeight: "90vh",
    padding: "16px 20px",
    borderRadius: 20,
    overflow: "visible",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000 },
};

// Filter options shown above the table
const FILTER_TYPES = ["All", "Egg", "Meat", "Vegetables"];

// Size options (id must match your DB)
const SIZE_OPTIONS = [
  { id: 1, label: "Small" },
  { id: 2, label: "Medium" },
  { id: 3, label: "Large" },
  { id: 4, label: "XL" },
];

export default function ProductManagement() {
  // filter + table refresh
  const [selectedType, setSelectedType] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // selection lifted from table
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // modal + mode
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnType, setBtnType] = useState(""); // "Add" | "Edit"

  // form state
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("Egg");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sizeId, setSizeId] = useState(2);
  const [discId, setDiscId] = useState(""); // optional
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");

  // ui state
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const resetForm = () => {
    setImageFile(null);
    setCategory("Egg");
    setTitle("");
    setDescription("");
    setSizeId(2);
    setDiscId("");
    setQty(0);
    setPrice("");
    setStatus("active");
  };

  const openAdd = () => {
    setBtnType("Add");
    resetForm();
    setErr(null);
    setIsModalOpen(true);
  };

  const openEdit = () => {
    if (!selectedRow) {
      alert("Please select a product first.");
      return;
    }
    setBtnType("Edit");
    // prefill from selected row
    setCategory(selectedRow.category || "Egg");
    setTitle(selectedRow.prod_name || "");
    setDescription(selectedRow.prod_description || "");
    setSizeId(selectedRow.size_id || 2);
    setDiscId(
      selectedRow.disc_id !== undefined && selectedRow.disc_id !== null
        ? String(selectedRow.disc_id)
        : ""
    );
    setQty(selectedRow.product_qty || 0);
    setPrice(selectedRow.prod_unit_price || "");
    setStatus(selectedRow.prod_status || "active");
    setImageFile(null);
    setErr(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErr(null);
  };

  // save handler (Add or Edit) — FRONT-END ONLY (no backend)
  const saveProduct = async () => {
    setErr(null);

    if (!title.trim()) {
      setErr("Product title is required");
      return;
    }
    if (!sizeId) {
      setErr("Please select a size");
      return;
    }

    setSaving(true);
    try {
      // 🔸 No backend calls — just simulate a successful save
      const payload = {
        category,
        prod_name: title,
        prod_description: description,
        size_id: Number(sizeId),
        disc_id: discId ? Number(discId) : undefined,
        product_qty: Number(qty),
        prod_unit_price: price,
        prod_status: status,
        imageFile: imageFile || undefined,
      };

      // You can inspect in console for now
      console.log(`[Front-end only] ${btnType} product payload:`, payload);

      // Trigger table refresh hook (your table may ignore this if it fetches remotely)
      setRefreshKey((k) => k + 1);
      setIsModalOpen(false);
    } catch (e) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-row justify-between items-center">
        {/* Filter */}
        <div className="flex flex-row items-center gap-2 border border-gray-300 shadow-md rounded-lg px-2 py-1.5 text-gray-600">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent outline-none text-lg cursor-pointer"
          >
            <option value="" disabled>
              Filter by Type
            </option>
            {FILTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-5 h-full items-end">
          <button
            type="button"
            onClick={openEdit}
            className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
          >
            Edit Product
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-lg border border-gray-200 shadow-lg">
        <ProductTable
          type={selectedType}
          refreshKey={refreshKey}
          selectedId={selectedId}
          onSelect={(row) => {
            setSelectedId(row.prod_id);
            setSelectedRow(row);
          }}
        />
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={modalStyle}>
        <div className="flex flex-col gap-6">
          <h1 className="text-primaryYellow text-2xl font-bold text-center">
            {btnType} Product Details
          </h1>

          <div className="grid grid-cols-12 gap-6">
            {/* Image */}
            <label className="col-span-5 flex items-center justify-center border rounded-xl p-4 cursor-pointer text-gray-500 hover:bg-gray-100 shadow">
              <span>{imageFile ? imageFile.name : "Upload Product Image"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>

            {/* Right column inputs */}
            <div className="col-span-7 grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="col-span-2">
                <label className="mb-2 block font-semibold text-gray-600">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                >
                  <option value="Egg">Egg</option>
                  <option value="Meat">Meat</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>

              {/* Title */}
              <div className="col-span-2">
                <label className="mb-2 block font-semibold text-gray-600">
                  Product Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                  placeholder="Enter product title"
                />
              </div>

              {/* Size */}
              <div>
                <label className="mb-2 block font-semibold text-gray-600">
                  Size
                </label>
                <select
                  value={sizeId}
                  onChange={(e) => setSizeId(Number(e.target.value))}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount (optional) */}
              <div>
                <label className="mb-2 block font-semibold text-gray-600">
                  Discount ID (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={discId}
                  onChange={(e) => setDiscId(e.target.value)}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                  placeholder="e.g., 3"
                />
              </div>

              {/* Qty */}
              <div>
                <label className="mb-2 block font-semibold text-gray-600">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block font-semibold text-gray-600">
                  Unit Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                />
              </div>

              {/* Status */}
              <div className="col-span-2">
                <label className="mb-2 block font-semibold text-gray-600">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-lg p-3 text-gray-700 shadow"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>

            {/* Description full width */}
            <div className="col-span-12">
              <label className="mb-2 block font-semibold text-gray-600">
                Product Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-3 text-gray-700 shadow resize-none"
              />
            </div>
          </div>

          {err && <p className="text-red-600 text-sm">{err}</p>}

          <div className="flex gap-5">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-400 text-white rounded-lg px-5 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveProduct}
              disabled={saving}
              className="flex-1 bg-primaryYellow text-white rounded-lg px-5 py-2 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
