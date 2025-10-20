// services/OrderNAllocation.js
import { supabase } from "@/lib/supabase";
import { fetchSizeMetaMap } from "@/services/EggInventory";

/* ------------ small utils ------------ */

const iso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

const fullName = (row) => {
  const first = row?.buyer_first?.trim?.() || "";
  const last = row?.buyer_last?.trim?.() || "";
  const middle = row?.buyer_middle?.trim?.() || "";
  const pieces = [first, middle, last].filter(Boolean);
  return pieces.length ? pieces.join(" ") : (row?.buyer_email || "—");
};

/** Load size map: { [size_id]: {label, ept} } */
async function fetchSizeMap() {
  const { data, error } = await supabase
    .from("size")
    .select("size_id, size_description, eggs_per_tray")
    .order("size_id", { ascending: true });

  if (error) throw error;

  const map = {};
  (data || []).forEach((r) => {
    map[r.size_id] = {
      label: String(r.size_description || "").toUpperCase(),
      ept: Number(r.eggs_per_tray || 30),
    };
  });
  return map;
}

/* ------------ core API ------------ */

/** List admin orders via RPC `view_admin_orders` */
export async function listOrders({
  adminId = null,
  status = null,
  dateFrom = null,
  dateTo = null,
  productId = null,
} = {}) {
  const { data, error } = await supabase.rpc("view_admin_orders", {
    p_admin_id: adminId,
    p_status: status,
    p_date_from: iso(dateFrom),
    p_date_to: iso(dateTo),
    p_prod_id: productId,
  });
  if (error) throw error;

  return (data || []).map((r) => ({
    order_id: r.order_id,
    buyer_id: r.buyer_id,
    buyer_email: r.buyer_email ?? null,
    buyer_first: r.buyer_first ?? null,
    buyer_middle: r.buyer_middle ?? null,
    buyer_last: r.buyer_last ?? null,
    buyer_coop_name: r.buyer_coop_name ?? null,
    status: r.status,
    total: Number(r.total ?? 0),
    created_at: r.created_at,
    updated_at: r.updated_at,
    item_count: Number(r.item_count ?? 0),
    tray_qty_total: Number(r.tray_qty_total ?? 0),
    products: Array.isArray(r.products) ? r.products : [],
  }));
}

/** counts per status */
export async function getOrderStatusCounts(params = {}) {
  const rows = await listOrders({ ...params, status: null });
  return rows.reduce((acc, r) => {
    const key = (r.status || "").trim();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/** For your Order table UI shape */
export async function listOrdersForTable(params = {}) {
  const rows = await listOrders(params);
  return rows.map((r) => ({
    id: r.order_id,
    customer: fullName(r),
    dateOrdered: r.created_at,
    totalAmount: r.total,
    orderStatus: r.status,
    paymentStatus: "—",
    itemCount: r.item_count,
    trayQtyTotal: r.tray_qty_total,
    products: r.products,
    buyerId: r.buyer_id,
    buyerEmail: r.buyer_email,
    buyerCoopName: r.buyer_coop_name,
  }));
}

/** summarize trays by size across orders (optional helper) */
export async function summarizeAllocationBySize(params = {}) {
  const [rows, sizeMap] = await Promise.all([listOrders(params), fetchSizeMap()]);
  const bySize = new Map();

  for (const r of rows) {
    for (const p of r.products || []) {
      const sizeId = Number(p.size_id ?? 0);
      const trays = Number(p.tray_qty ?? 0);
      if (!sizeId || trays <= 0) continue;
      bySize.set(sizeId, (bySize.get(sizeId) || 0) + trays);
    }
  }

  const result = [];
  for (const [sizeId, trays] of bySize.entries()) {
    const meta = sizeMap[sizeId] || { label: String(sizeId), ept: 30 };
    result.push({ size_id: sizeId, size: meta.label, trays, eggs: trays * meta.ept });
  }
  result.sort((a, b) => a.size_id - b.size_id);
  return result;
}

/** trays required by THIS order for a given size label */
export async function getOrderSizeRequirement(orderId, sizeLabel) {
  const sizeMap = await fetchSizeMetaMap();
  const meta = sizeMap[String(sizeLabel || "").toUpperCase()];
  if (!meta) return { trays: 0, sizeId: null, ept: 30 };

  const rows = await listOrders({ status: null });
  const order = rows.find((r) => r.order_id === Number(orderId));
  if (!order) return { trays: 0, sizeId: meta.id, ept: meta.ept };

  const trays = (order.products || [])
    .filter((p) => Number(p.size_id) === Number(meta.id))
    .reduce((sum, p) => sum + Number(p.tray_qty || 0), 0);

  return { trays, sizeId: meta.id, ept: meta.ept };
}

/** NEW: all size requirements for a given order (array) */
export async function getOrderSizeRequirements(orderId) {
  const sizeMeta = await fetchSizeMetaMap(); // { LABEL: {id,ept} }

  const rows = await listOrders({ status: null });
  const order = rows.find((r) => r.order_id === Number(orderId));
  if (!order) return [];

  // Aggregate by size_id
  const byId = new Map();
  for (const p of order.products || []) {
    const sid = Number(p.size_id || 0);
    const trays = Number(p.tray_qty || 0);
    if (!sid || trays <= 0) continue;
    byId.set(sid, (byId.get(sid) || 0) + trays);
  }

  // Convert to array with label & ept
  const result = [];
  for (const [sid, trays] of byId.entries()) {
    const entry = Object.entries(sizeMeta).find(([label, v]) => Number(v.id) === Number(sid));
    const [label, meta] = entry || [`#${sid}`, { id: sid, ept: 30 }];
    result.push({ sizeId: sid, sizeLabel: label, trays, ept: meta.ept });
  }

  result.sort((a, b) => a.sizeId - b.sizeId);
  return result;
}

export async function adminMarkOrderToShip(orderId, { actorId = null, roleId = null } = {}) {
  const { error } = await supabase.rpc("admin_mark_order_to_ship", {
    p_order_id: orderId,
    p_actor_id: actorId,
    p_role_id: roleId,
  });
  if (error) throw error;
}

export async function adminCreateAllocationBulk({
  orderId,
  sizeId,
  details,
  actorId = null,
  roleId = null,
} = {}) {
  if (!Array.isArray(details) || details.length === 0) {
    throw new Error("details must be a non-empty array");
  }

  // sanitize: keep only needed fields; coerce numbers; prefer eggs over trays per row
  const clean = details.map((d) => {
    const key = String(d.supply_row_key || d.supplyRowKey || "").trim();
    const eggs = d.eggs != null ? Math.max(0, Math.floor(Number(d.eggs))) : null;
    const trays =
      eggs == null && d.trays != null
        ? Math.max(0, Math.floor(Number(d.trays)))
        : null;

    if (!key) throw new Error("Each detail needs supply_row_key");
    if ((eggs == null) && (trays == null)) {
      throw new Error("Each detail needs eggs or trays");
    }

    // backend accepts either eggs or trays; include only the one we intend
    const row = { supply_row_key: key };
    if (eggs != null) row.eggs = eggs;
    else row.trays = trays; // only if eggs not provided

    return row;
  });

  const { data, error } = await supabase.rpc("admin_create_allocation_bulk", {
    p_order_id: orderId,
    p_size_id: sizeId,
    p_details: clean,   // [{ supply_row_key, eggs? | trays? }]
    p_actor_id: actorId,
    p_role_id: roleId,
  });

  if (error) throw error;
  return data; // { created_ids: [...], warning: null|string }
}

/**
 * Optional convenience: allocate purely by eggs (you give per-row eggs).
 */
export async function adminCreateAllocationByEggs({
  orderId,
  sizeId,
  items, // [{ supply_row_key, eggs }]
  actorId = null,
  roleId = null,
} = {}) {
  const details = (items || []).map((x) => ({
    supply_row_key: x.supply_row_key,
    eggs: Math.max(0, Math.floor(Number(x.eggs || 0))),
  }));
  return adminCreateAllocationBulk({ orderId, sizeId, details, actorId, roleId });
}



// 
// V I E W S
// 

export async function listAllocationGroups({
  orderId = null,
  farmerId = null,
  dateFrom = null,
  dateTo = null,
  defaultShelf = 21,
} = {}) {
  const { data, error } = await supabase.rpc(
    "admin_view_order_allocation_grouped_live",
    {
      p_order_id: orderId ?? null,
      p_farmer_id: farmerId ?? null,
      p_date_from: dateFrom ? new Date(dateFrom).toISOString().slice(0, 10) : null,
      p_date_to: dateTo ? new Date(dateTo).toISOString().slice(0, 10) : null,
      p_default_shelf: defaultShelf,
    }
  );
  if (error) throw error;

  // Normalize shape for the UI
  return (data || []).map((r) => ({
    orderId: r.order_id,
    orderStatus: r.order_status,
    farmerId: r.farmer_id,
    farmerName: r.farmer_name || r.farmer_id,
    produced: r.produced, // YYYY-MM-DD
    sizeBreakdown: Array.isArray(r.size_breakdown)
      ? r.size_breakdown.map((x) => ({
          size: x.size,
          trays: Number(x.trays || 0),
          eggs: Number(x.eggs || 0),
        }))
      : [],
    totalTrays: Number(r.total_trays || 0),
    totalEggs: Number(r.total_eggs || 0),
    freshnessStatus: r.status, // Fresh | Sell Soon | Expiring | Expired
    daysToExpiry: r.days_to_expiry,
    allocCount: Number(r.alloc_count || 0),
    statusCounts: r.status_counts || {}, // {pending:2,confirmed:1,...}
    topAllocStatus: r.top_alloc_status || null,
  }));
}

// /**
//  * Grouped allocations (farmer + produced date) with client-side filters
//  *
//  * RPC filters:
//  *  - orderId, farmerId, dateFrom, dateTo, defaultShelf
//  *
//  * Client-side filters:
//  *  - minTrays, maxTrays
//  *  - freshnessBuckets (["Fresh","Sell Soon","Expiring","Expired"])
//  *  - includeSizes (["S","M",...]) -> keeps groups where ANY size in breakdown matches
//  *
//  * Sorting & paging similar to above:
//  *  - sortBy: "produced" | "trays" | "eggs" | "daysToExpiry" | "topAllocStatus"
//  *  - sortDir: "asc" | "desc"
//  */
// export async function listAllocationGroups({
//   // server-side filters (RPC)
//   orderId = null,
//   farmerId = null,
//   dateFrom = null,
//   dateTo = null,
//   defaultShelf = 21,

//   // client-side filters
//   minTrays = null,
//   maxTrays = null,
//   freshnessBuckets = null,   // e.g., ["Fresh","Expiring"]
//   includeSizes = null,       // e.g., ["S","M"]

//   // sorting & paging
//   sortBy = "produced",
//   sortDir = "asc",
//   page = 1,
//   pageSize = 20,
// } = {}) {
//   const { data, error } = await supabase.rpc("admin_view_order_allocation_grouped_live", {
//     p_order_id: orderId ?? null,
//     p_farmer_id: farmerId ?? null,
//     p_date_from: dateFrom ? new Date(dateFrom).toISOString().slice(0, 10) : null,
//     p_date_to: dateTo ? new Date(dateTo).toISOString().slice(0, 10) : null,
//     p_default_shelf: defaultShelf ?? 21,
//   });
//   if (error) throw error;

//   let rows = (data || []).map((r) => ({
//     farmerId: r.farmer_id,
//     farmerName: r.farmer_name || r.farmer_id,
//     produced: r.produced, // date
//     sizeBreakdown: Array.isArray(r.size_breakdown)
//       ? r.size_breakdown.map((x) => ({
//           size: x.size,
//           trays: Number(x.trays || 0),
//           eggs: Number(x.eggs || 0),
//         }))
//       : [],
//     totalTrays: Number(r.total_trays || 0),
//     totalEggs: Number(r.total_eggs || 0),
//     freshnessStatus: r.status,      // Fresh / Sell Soon / Expiring / Expired
//     daysToExpiry: r.days_to_expiry, // int
//     allocCount: Number(r.alloc_count || 0),
//     statusCounts: r.status_counts || {},       // { pending: 2, confirmed: 1, ... }
//     topAllocStatus: r.top_alloc_status || null // "pending"...
//   }));

//   // --- client-side filters ---
//   if (minTrays != null) rows = rows.filter((r) => r.totalTrays >= Number(minTrays));
//   if (maxTrays != null) rows = rows.filter((r) => r.totalTrays <= Number(maxTrays));

//   if (Array.isArray(freshnessBuckets) && freshnessBuckets.length) {
//     const set = new Set(freshnessBuckets.map((s) => String(s)));
//     rows = rows.filter((r) => set.has(r.freshnessStatus));
//   }

//   if (Array.isArray(includeSizes) && includeSizes.length) {
//     const set = new Set(includeSizes.map((s) => String(s).toUpperCase()));
//     rows = rows.filter((r) =>
//       (r.sizeBreakdown || []).some((s) => set.has(String(s.size || "").toUpperCase()))
//     );
//   }

//   // --- sorting ---
//   const cmpNum = (a, b, key) => (Number(a[key] ?? 0) - Number(b[key] ?? 0));
//   const cmpDate = (a, b, key) => {
//     const ta = a[key] ? new Date(a[key]).getTime() : 0;
//     const tb = b[key] ? new Date(b[key]).getTime() : 0;
//     return ta - tb;
//   };
//   const cmpStr = (a, b, key) => String(a[key] ?? "").localeCompare(String(b[key] ?? ""));

//   rows.sort((a, b) => {
//     let res = 0;
//     switch (sortBy) {
//       case "trays":        res = cmpNum(a, b, "totalTrays"); break;
//       case "eggs":         res = cmpNum(a, b, "totalEggs");  break;
//       case "daysToExpiry": res = cmpNum(a, b, "daysToExpiry"); break;
//       case "topAllocStatus": res = cmpStr(a, b, "topAllocStatus"); break;
//       default:             res = cmpDate(a, b, "produced");
//     }
//     return sortDir === "desc" ? -res : res;
//   });

//   // --- pagination ---
//   const total = rows.length;
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const p = Math.max(1, Math.min(page, totalPages));
//   const start = (p - 1) * pageSize;
//   const end = Math.min(start + pageSize, total);

//   return {
//     rows: rows.slice(start, end),
//     total,
//     page: p,
//     totalPages,
//   };
// }