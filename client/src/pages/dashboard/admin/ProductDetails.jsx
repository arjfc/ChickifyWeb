// pages/admin/products/ProductDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import Card from "../../../components/Card";
import { IoFilterOutline } from "react-icons/io5";
import { FaCircleInfo } from "react-icons/fa6";
import ProductTable from "../../../components/admin/tables/ProductTable";
import SmallCard from "../../../components/super-admin/SmallCard";
import Modal from "react-modal";
import TrayEggImg from "../../../assets/tray-egg.png";

import {
  listCategories,
  listSizes,
  listMyProducts,
  upsertProduct,
  uploadProductImage,
} from "@/services/Products";

import { getMyUserProfile, hasProfileAddress } from "@/services/Profile";

/* ---------- Small toast helper ---------- */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const palette = {
    success: "bg-green-50 border-green-300 text-green-800 shadow-green-100",
    warning: "bg-amber-50 border-amber-300 text-amber-900 shadow-amber-100",
    error: "bg-red-50 border-red-300 text-red-800 shadow-red-100",
  };
  const styles = palette[toast.type || "warning"];

  return (
    <div className="fixed top-6 right-6 z-[2000]">
      <div
        className={`max-w-sm w-[360px] rounded-xl border p-4 shadow-lg ${styles}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="text-xl leading-none">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold mb-1">{toast.title}</p>
            <p className="text-sm opacity-90 whitespace-pre-line">
              {toast.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 rounded-md text-xs hover:bg-black/5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

const modalBaseStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 20,
    maxHeight: "100vh",
    overflow: "visible",
    width: "90%",
    maxWidth: "600px",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000 },
};

// Info modal for "Price per Tray"
const modalStyle2 = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 10,
    maxHeight: "100vh",
    width: "25vw",
    minWidth: 320,
    overflow: "visible",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
  },
};

// Static base price guide (just a visual reference for admins)
const basePriceSizes = [
  { size: "Extra Large", id: "xl", number: 220 },
  { size: "Large", id: "lg", number: 200 },
  { size: "Medium", id: "md", number: 180 },
  { size: "Small", id: "sm", number: 150 },
  { size: "Extra Small", id: "xs", number: 120 },
];

export default function ProductDetails() {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnType, setBtnType] = useState("");
  const [products, setProducts] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    prod_id: null,
    prod_name: "",
    prod_description: "",
    p_categ_id: "",
    size_id: "",
    prod_price_per_tray: "",
    prod_status: "active",
    prod_img: "",
    min_bundle_trays: 5,
    max_bundle_trays: 100,
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // base price info modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const handleInfoModal = () => setIsInfoModalOpen((s) => !s);

  // toast state
  const [toast, setToast] = useState(null);
  const notify = (message, type = "warning", title = "Action needed") => {
    setToast({ message, type, title });
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 4500);
  };

  /* ---------- helpers ---------- */
  function validateProductForm(f) {
    const errors = [];
    if (!f.prod_name?.trim()) errors.push("• Product name is required.");
    if (!f.p_categ_id) errors.push("• Category is required.");
    if (!f.size_id) errors.push("• Size is required.");

    const price = Number(f.prod_price_per_tray);
    if (!Number.isFinite(price) || price <= 0)
      errors.push("• Price / Tray must be a positive number.");

    if (!["active", "inactive"].includes(String(f.prod_status)))
      errors.push("• Status must be active or inactive.");

    const minTrays = Number(f.min_bundle_trays);
    const maxTrays = Number(f.max_bundle_trays);

    if (!Number.isFinite(minTrays) || minTrays <= 0) {
      errors.push("• Minimum trays per order must be a positive number.");
    }
    if (!Number.isFinite(maxTrays) || maxTrays <= 0) {
      errors.push("• Maximum trays per order must be a positive number.");
    }
    if (
      Number.isFinite(minTrays) &&
      Number.isFinite(maxTrays) &&
      minTrays > maxTrays
    ) {
      errors.push("• Minimum trays cannot be greater than maximum trays.");
    }

    return errors;
  }

  async function refreshProfile() {
    try {
      const p = await getMyUserProfile();
      setProfile(p);
      return p;
    } catch (e) {
      console.error("profile load error:", e);
      return null;
    }
  }

  /* ---------- initial data ---------- */
  useEffect(() => {
    (async () => {
      const [cats, sz] = await Promise.all([listCategories(), listSizes()]);
      setCategories(cats);
      setSizes(sz);
    })().catch((e) => {
      console.error("dropdown load error:", e);
      notify(e.message || "Failed to load options", "error", "Error");
    });
  }, []);

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState === "visible") {
        try {
          const p = await getMyUserProfile();
          setProfile(p);
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* ---------- data list ---------- */
  async function reloadList() {
    try {
      setLoading(true);
      const rows = await listMyProducts();
      const filtered =
        selectedCategoryId != null
          ? rows.filter((r) => r.p_categ_id === Number(selectedCategoryId))
          : rows;

      setProducts(filtered);
      setCurrent(filtered?.[0] ?? null);
    } catch (e) {
      console.error("product_list_by_owner error:", e);
      notify(e.message || "Failed to load products", "error", "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  /* ---------- UI handlers ---------- */
  const onClickAdd = async () => {
    const p = await refreshProfile();
    if (!hasProfileAddress(p)) {
      notify(
        "Please complete your address (province, municipal/city, barangay, latitude & longitude) in Account Settings before adding a product."
      );
      return;
    }

    setBtnType("Add");
    setForm({
      prod_id: null,
      prod_name: "",
      prod_description: "",
      p_categ_id: categories[0]?.p_categ_id || "",
      size_id: sizes[0]?.size_id || "",
      prod_price_per_tray: "",
      prod_status: "active",
      prod_img: "",
      min_bundle_trays: 5,
      max_bundle_trays: 100,
    });
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const onClickEdit = (product) => {
    setBtnType("Edit");
    setForm({
      prod_id: product.prod_id,
      prod_name: product.prod_name,
      prod_description: product.prod_description || "",
      p_categ_id: product.p_categ_id,
      size_id: product.size_id,
      prod_price_per_tray: product.prod_price_per_tray,
      prod_status: product.prod_status,
      prod_img: product.prod_img || "",
      min_bundle_trays: product.min_bundle_trays ?? 5,
      max_bundle_trays: product.max_bundle_trays ?? 100,
    });
    setPreviewUrl(product.prod_img || "");
    setIsModalOpen(true);
  };

  async function onSave() {
    const p = profile ?? (await refreshProfile());
    if (!hasProfileAddress(p)) {
      notify(
        "You must complete your address (province, municipal/city, barangay, latitude & longitude) in Account Settings before saving a product."
      );
      return;
    }

    const errs = validateProductForm(form);
    if (errs.length) {
      notify(errs.join("\n"), "warning", "Check your inputs");
      return;
    }

    try {
      await upsertProduct({
        ...form,
        p_categ_id: Number(form.p_categ_id),
        size_id: Number(form.size_id),
        prod_price_per_tray: Number(form.prod_price_per_tray),
        min_bundle_trays: Number(form.min_bundle_trays),
        max_bundle_trays: Number(form.max_bundle_trays),
      });
      setIsModalOpen(false);
      await reloadList();
      notify("Product saved successfully.", "success", "Saved");
    } catch (e) {
      console.error("upsert error:", e);
      notify(e.message || "Failed to save product", "error", "Error");
    }
  }

  const sizesHeader = useMemo(
    () => (current?.size ? [current.size] : []),
    [current]
  );

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT + RIGHT cards */}
        <div className="flex flex-col gap-5 lg:flex-row w-full col-span-2">
          <Card>
            <div className="flex flex-col gap-3">
              <h1 className="text-base md:text-lg text-gray-400 font-bold italic">
                Category: {current?.category || "—"}
              </h1>
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="p-4 bg-softSecondaryYellow shadow-md rounded-lg">
                  <img
                    src={current?.prod_img || TrayEggImg}
                    alt="Product"
                    className="w-40 sm:w-50"
                  />
                </div>
                <div className="flex flex-col gap-2 text-center sm:text-left">
                  <h1 className="text-primaryYellow font-bold text-xl sm:text-2xl">
                    {current?.prod_name || "—"}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {current?.prod_description || "—"}
                  </p>
                  <div className="text-sm text-gray-600">
                    Price / Tray:{" "}
                    {current
                      ? Number(current.prod_price_per_tray).toFixed(2)
                      : "—"}
                    <br />
                    Status: {current?.prod_status || "—"}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* RIGHT CARD */}
          <Card>
            <div className="flex flex-col gap-5">
              <h1 className="text-gray-400 text-lg font-bold">
                Recently Available Size
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {sizesHeader.map((label, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-full text-xs sm:text-sm font-bold bg-softSecondaryYellow text-primaryYellow"
                  >
                    {label}
                  </div>
                ))}
                {!sizesHeader.length && (
                  <div className="text-gray-400 text-sm">No size</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedCategoryId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedCategoryId(v ? Number(v) : null);
                  }}
                  className="border border-gray-300 shadow-md rounded-lg px-3 py-2 text-gray-600 bg-white text-sm sm:text-base"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.p_categ_id} value={c.p_categ_id}>
                      {c.category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={reloadList}
                  className="flex items-center border rounded-lg px-3 sm:px-5 py-2 text-gray-600 hover:border-primaryYellow hover:text-primaryYellow"
                  title="Apply filter"
                >
                  <IoFilterOutline />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* CURRENT BASE PRICE CARD (guide) */}
        <div className="col-span-2">
          <div className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 shadow-lg">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-2 items-center">
                <h1 className="text-lg md:text-xl text-primaryYellow font-semibold">
                  Current Base Price of Tray
                </h1>
                <FaCircleInfo
                  onClick={handleInfoModal}
                  className="text-base text-gray-400 cursor-pointer"
                  title="What is Price per Tray?"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
              {basePriceSizes.map((data) => (
                <SmallCard
                  size={data.size}
                  id={data.id}
                  key={data.id}
                  number={data.number}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TABLE + Add button */}
        <div className="col-span-2 p-4 sm:p-6 rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
          <div className="flex justify-end mb-3">
            <button
              onClick={onClickAdd}
              className="bg-primaryYellow text-white text-sm sm:text-lg font-medium rounded-lg px-4 sm:px-5 py-2 hover:opacity-90"
            >
              Add Product
            </button>
          </div>
          <ProductTable
            products={products}
            loading={loading}
            onEdit={onClickEdit}
          />
        </div>

        {/* PRODUCT MODAL */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          style={modalBaseStyle}
        >
          <div className="flex flex-col p-4 sm:p-8 space-y-6">
            <h1 className="text-primaryYellow text-xl sm:text-2xl font-bold text-center">
              {btnType} Product Details
            </h1>

            {/* Row 1: Image + Category + Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Upload Product Image */}
              <div className="w-full">
                <label
                  className="relative block w-full border rounded-lg shadow-md bg-gray-50"
                  style={{ height: 180 }}
                >
                  {previewUrl || form.prod_img ? (
                    <img
                      src={previewUrl || form.prod_img}
                      alt="preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Change Image
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;

                      const local = URL.createObjectURL(f);
                      setPreviewUrl(local);

                      try {
                        setIsUploading(true);
                        const publicUrl = await uploadProductImage(f);
                        setForm((v) => ({ ...v, prod_img: publicUrl }));
                      } catch (err) {
                        console.error("upload error:", err);
                        notify(
                          err.message || "Upload failed",
                          "error",
                          "Error"
                        );
                        setPreviewUrl("");
                      } finally {
                        setIsUploading(false);
                        URL.revokeObjectURL(local);
                      }
                    }}
                  />
                </label>

                <div className="mt-1 text-xs text-gray-500">
                  {isUploading
                    ? "Uploading image…"
                    : "Click the box to choose an image"}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Category */}
                <div className="flex flex-col">
                  <label className="mb-2 font-bold text-gray-400">
                    Category
                  </label>
                  <select
                    value={form.p_categ_id || ""}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        p_categ_id: Number(e.target.value),
                      }))
                    }
                    className="border rounded-lg p-3 text-gray-600 shadow-md"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.p_categ_id} value={c.p_categ_id}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div className="flex flex-col">
                  <label className="mb-2 font-bold text-gray-400">Size</label>
                  <select
                    value={form.size_id || ""}
                    onChange={(e) =>
                      setForm((v) => ({
                        ...v,
                        size_id: Number(e.target.value),
                      }))
                    }
                    className="border rounded-lg p-3 text-gray-600 shadow-md"
                  >
                    <option value="" disabled>
                      Select a size
                    </option>
                    {sizes.map((s) => (
                      <option key={s.size_id} value={s.size_id}>
                        {s.size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-2 font-bold text-gray-400">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                value={form.prod_name}
                onChange={(e) =>
                  setForm((v) => ({ ...v, prod_name: e.target.value }))
                }
                className="border rounded-lg p-3 text-gray-600 shadow-md"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="mb-2 font-bold text-gray-400">
                Product Description
              </label>
              <textarea
                placeholder="Enter product description"
                value={form.prod_description}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    prod_description: e.target.value,
                  }))
                }
                className="border rounded-lg p-3 resize-none shadow-md text-gray-600"
                rows={3}
              />
            </div>

            {/* Price + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">
                  Price / Tray
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.prod_price_per_tray}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      prod_price_per_tray: e.target.value,
                    }))
                  }
                  className="border rounded-lg p-3 text-gray-600 shadow-md"
                  placeholder="e.g., 210.00"
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">Status</label>
                <select
                  value={form.prod_status}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, prod_status: e.target.value }))
                  }
                  className="border rounded-lg p-3 text-gray-600 shadow-md"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            </div>

            {/* Min / Max bundles (trays) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">
                  Minimum Order (trays)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.min_bundle_trays}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      min_bundle_trays: e.target.value,
                    }))
                  }
                  className="border rounded-lg p-3 text-gray-600 shadow-md"
                  placeholder="e.g., 5"
                />
                <span className="mt-1 text-xs text-gray-400">
                  Example: 5 trays ≈ 150 eggs if 1 tray = 30 eggs
                </span>
              </div>

              <div className="flex flex-col">
                <label className="mb-2 font-bold text-gray-400">
                  Maximum Order (trays)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.max_bundle_trays}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      max_bundle_trays: e.target.value,
                    }))
                  }
                  className="border rounded-lg p-3 text-gray-600 shadow-md"
                  placeholder="e.g., 100"
                />
                <span className="mt-1 text-xs text-gray-400">
                  Must be greater than or equal to minimum trays.
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-400 text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex-1 bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
                disabled={isUploading}
                title={
                  isUploading
                    ? "Please wait for the image upload to finish"
                    : ""
                }
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>

        {/* INFO MODAL: Price per Tray explanation */}
        <Modal
          isOpen={isInfoModalOpen}
          onRequestClose={handleInfoModal}
          style={modalStyle2}
          ariaHideApp={false}
        >
          <div className="flex flex-col gap-5 items-center justify-center p-6">
            <h1 className="text-primaryYellow font-bold text-xl">
              Price Per Tray
            </h1>
            <p className="font-semibold opacity-70 text-center text-sm">
              Price per Tray refers to the cost assigned to one standard tray of
              eggs (typically 30 pieces). It serves as the base unit for pricing
              in egg sales. This metric is commonly used in poultry trading
              because it standardizes egg pricing, making it simple to compare,
              track, and adjust prices across markets.
            </p>
            <div
              onClick={handleInfoModal}
              className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90 w-full text-center"
            >
              <p className="text-lg">Okay</p>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
