// services/Products.js
import { supabase } from "@/lib/supabase";

/* ---------- Dropdowns (RPC) ---------- */

export async function listCategories() {
  const { data, error } = await supabase.rpc("rpc_list_categories");
  if (error) throw error;
  return data || []; // [{ p_categ_id, category }]
}

export async function listSizes() {
  const { data, error } = await supabase.rpc("rpc_list_sizes");
  if (error) throw error;
  return data || []; // [{ size_id, size }]
}

/* ---------- Admin-only products (owner = auth.uid()) ---------- */

export async function listMyProducts() {
  const { data, error } = await supabase.rpc("product_list_by_owner");
  if (error) throw error;

  // Normalize shape + types for the UI
  return (data || []).map((r) => ({
    prod_id: r.prod_id,
    prod_name: r.prod_name,
    prod_description: r.prod_description,
    p_categ_id: r.p_categ_id,
    category: r.category,
    size_id: r.size_id,
    size: r.size,
    prod_price_per_tray: Number(r.prod_price_per_tray ?? 0),
    prod_status: r.prod_status,
    prod_img: r.prod_img || "",
    min_bundle_trays: r.min_bundle_trays ?? null,
    max_bundle_trays: r.max_bundle_trays ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

/* ---------- Upsert (insert/update) via RPC ---------- */

function validateProductPayload(payload) {
  const errors = [];

  const name = (payload.prod_name || "").trim();
  if (!name) errors.push("• Product name is required.");

  if (!payload.p_categ_id) errors.push("• Category is required.");
  if (!payload.size_id) errors.push("• Size is required.");

  const price = Number(payload.prod_price_per_tray);
  if (!Number.isFinite(price) || price <= 0) {
    errors.push("• Price / tray must be a positive number.");
  }

  const status = String(payload.prod_status || "");
  if (!["active", "inactive"].includes(status)) {
    errors.push("• Status must be either 'active' or 'inactive'.");
  }

  const minTrays =
    payload.min_bundle_trays != null
      ? Number(payload.min_bundle_trays)
      : null;
  const maxTrays =
    payload.max_bundle_trays != null
      ? Number(payload.max_bundle_trays)
      : null;

  if (minTrays == null || !Number.isFinite(minTrays) || minTrays <= 0) {
    errors.push("• Minimum trays per order must be a positive number.");
  }
  if (maxTrays == null || !Number.isFinite(maxTrays) || maxTrays <= 0) {
    errors.push("• Maximum trays per order must be a positive number.");
  }
  if (
    Number.isFinite(minTrays) &&
    Number.isFinite(maxTrays) &&
    minTrays > maxTrays
  ) {
    errors.push("• Minimum trays cannot be greater than maximum trays.");
  }

  return { errors, minTrays, maxTrays, price, status, name };
}

export async function upsertProduct(payload) {
  const {
    prod_id = null,
    prod_description = "",
    p_categ_id,
    size_id,
    prod_img = "",
  } = payload;

  // Validate fields before hitting the RPC
  const {
    errors,
    minTrays,
    maxTrays,
    price,
    status,
    name,
  } = validateProductPayload(payload);

  if (errors.length) {
    // Let the caller catch this and show in a toast / alert
    throw new Error(errors.join("\n"));
  }

  const { data, error } = await supabase.rpc("product_upsert", {
    p_name: name,
    p_desc: String(prod_description ?? ""),
    p_categ_id: Number(p_categ_id),
    p_size_id: Number(size_id),
    p_price: price,
    p_status: status,
    p_img: String(prod_img ?? ""),
    p_min_bundle_trays: minTrays,
    p_max_bundle_trays: maxTrays,
    p_prod_id: prod_id == null ? null : Number(prod_id),
  });

  if (error) throw error;
  return data; // prod_id
}

/* ---------- Storage (images) ---------- */

/** Uploads a product image to the "products" bucket and returns the public URL.
 *  @param {File} file
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error("No file selected");
  const ext = (file.name || "img.jpg").split(".").pop();
  const path = `uploads/${crypto.randomUUID()}.${ext}`;

  const { error: uploadErr } = await supabase
    .storage.from("products") // bucket name MUST exist in your project
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}

function assertNoError(error) {
  if (error) throw error;
}

export async function fetchCoopBasePrices() {
  const { data, error } = await supabase.rpc("coop_list_baseprice");
  assertNoError(error);
  return data ?? [];
}

/**
 * Update coop base price (per tray) for a given size
 * RPC: coop_upsert_baseprice(p_size_id, p_price_per_tray)
 */
export async function upsertCoopBasePrice(sizeId, pricePerTray) {
  const { data, error } = await supabase.rpc("coop_upsert_baseprice", {
    p_size_id: sizeId,
    p_price_per_tray: pricePerTray,
  });
  assertNoError(error);
  return data;
}

/* ---- optional: quick debug to ensure you're in the right project ---- */
export async function debugListBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  return data.map((b) => b.name);


}
