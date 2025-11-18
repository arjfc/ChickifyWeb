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
  return data || [];
}

/* ---------- Upsert (insert/update) via RPC ---------- */
export async function upsertProduct(payload) {
  const {
    prod_id = null,
    prod_name,
    prod_description = "",
    p_categ_id,
    size_id,
    prod_price_per_tray,
    prod_status,
    prod_img = "",
  } = payload;

  const { data, error } = await supabase.rpc("product_upsert", {
    p_name: String(prod_name),
    p_desc: String(prod_description ?? ""),
    p_categ_id: Number(p_categ_id),
    p_size_id: Number(size_id),
    p_price: Number(prod_price_per_tray),
    p_status: String(prod_status),
    p_img: String(prod_img ?? ""),
    p_prod_id: prod_id == null ? null : Number(prod_id),
  });

  if (error) throw error;
  return data; // prod_id
}

/* ---------- Storage (images) ---------- */
/* ===== Storage: public bucket version ===== */
/** @param {File} file */
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

  // For public bucket:
  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return data.publicUrl;
}



/* ---- optional: quick debug to ensure you're in the right project ---- */
export async function debugListBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  return data.map(b => b.name);
}

