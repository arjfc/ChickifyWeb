import React, { useEffect, useMemo, useState } from "react";
import {
  fetchMyCoopFarmersForFilterRpc,
  fetchMyServiceAvailmentsRpc,
} from "@/services/coopServicePlan";

/* ----------------------------- Small UI bits  ----------------------------- */

function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-300",
    secondary: "bg-gray-900 text-white hover:bg-gray-800",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-800",
    good: "bg-green-100 text-green-800",
    warn: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}
function Th({ children }) {
  return (
    <th className="whitespace-nowrap bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-600">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`whitespace-nowrap border-t border-gray-100 px-4 py-3 text-gray-800 ${className}`}>
      {children}
    </td>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-yellow-400 ${className}`}
      {...props}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-yellow-400 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/* ----------------------------- helpers ----------------------------- */

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function monthsLabel(m) {
  const n = Number(m || 0);
  if (!n) return "—";
  if (n === 12) return "1 year";
  if (n === 18) return "1.5 years";
  if (n === 24) return "2 years";
  if (n % 12 === 0) return `${n / 12} years`;
  return `${n} months`;
}

function serviceTypeLabel(x) {
  if (x === "rtl_feeds") return "RTL + Feeds";
  if (x === "feeds_only") return "Feeds only";
  if (x === "rtl_only") return "RTL only";
  return x || "—";
}

function statusTone(s) {
  if (s === "paid") return "good";
  if (s === "active") return "info";
  if (s === "pending") return "warn";
  if (s === "cancelled" || s === "ended") return "danger";
  return "neutral";
}

/* -------------------------------- Component -------------------------------- */

export default function CoopServiceAvailmentsTable() {
  const [loading, setLoading] = useState(true);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [err, setErr] = useState("");

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  const [farmers, setFarmers] = useState([]);

  // filters
  const [farmerId, setFarmerId] = useState("");
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // pagination
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  async function loadFarmers() {
    try {
      setLoadingFarmers(true);
      const list = await fetchMyCoopFarmersForFilterRpc();
      setFarmers(list || []);
    } finally {
      setLoadingFarmers(false);
    }
  }

  async function loadData(nextPage = 0, append = false) {
    try {
      setLoading(true);
      setErr("");

      const offset = nextPage * PAGE_SIZE;

      const res = await fetchMyServiceAvailmentsRpc({
        farmerId,
        status,
        serviceType,
        fromDate,
        toDate,
        limit: PAGE_SIZE,
        offset,
      });

      setCount(res?.count ?? 0);

      if (append) setRows((prev) => [...prev, ...(res?.rows || [])]);
      else setRows(res?.rows || []);

      setPage(nextPage);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarmers();
    loadData(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canLoadMore = useMemo(() => rows.length < count, [rows.length, count]);

  function clearFilters() {
    setFarmerId("");
    setStatus("");
    setServiceType("");
    setFromDate("");
    setToDate("");
    setTimeout(() => loadData(0, false), 0);
  }

  function applyFilters() {
    loadData(0, false);
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-gray-900">Service Availments</div>
          <div className="text-sm text-gray-600">
            Farmers who availed coop services.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => loadData(0, false)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* ✅ Filters in ONE LINE (horizontal, scrollable if needed) */}
      <div className="mb-4">
        <div className="flex flex-nowrap items-end gap-3 overflow-x-auto pb-1">
          <div className="min-w-[260px]">
            <div className="mb-1 text-xs font-bold text-gray-600">Farmer</div>
            <Select
              value={farmerId}
              onChange={(e) => setFarmerId(e.target.value)}
              disabled={loadingFarmers}
            >
              <option value="">{loadingFarmers ? "Loading farmers…" : "All farmers"}</option>
              {farmers.map((f) => (
                <option key={f.user_id} value={f.user_id}>
                  {f.label}
                  {f.contact_no ? ` • ${f.contact_no}` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-[160px]">
            <div className="mb-1 text-xs font-bold text-gray-600">Status</div>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="pending">pending</option>
              <option value="active">active</option>
              <option value="paid">paid</option>
              <option value="cancelled">cancelled</option>
              <option value="ended">ended</option>
            </Select>
          </div>

          <div className="min-w-[190px]">
            <div className="mb-1 text-xs font-bold text-gray-600">Availment type</div>
            <Select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="">All</option>
              <option value="rtl_feeds">RTL + Feeds</option>
              <option value="feeds_only">Feeds only</option>
              <option value="rtl_only">RTL only</option>
            </Select>
          </div>

          <div className="min-w-[170px]">
            <div className="mb-1 text-xs font-bold text-gray-600">Availment from</div>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="min-w-[170px]">
            <div className="mb-1 text-xs font-bold text-gray-600">Availment to</div>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" onClick={clearFilters} disabled={loading}>
              Clear
            </Button>
            <Button variant="primary" onClick={applyFilters} disabled={loading}>
              Apply
            </Button>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{rows.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{count}</span>
        </div>
      </div>

      {/* Table */}
      {loading && !rows.length ? (
        <div className="py-10 text-center text-sm text-gray-600">Loading availments…</div>
      ) : !rows.length ? (
        <div className="py-10 text-center text-sm text-gray-600">No availments found.</div>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Farmer</Th>
                <Th>Service</Th>
                <Th>Tier</Th>
                <Th>Status</Th>
                <Th>Payment model</Th>
                <Th>Total payable</Th>
                <Th>Paid</Th>
                <Th>Balance</Th>
                <Th>Availed at</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tierLabel = r?.tier_heads
                  ? `${r.tier_heads} heads • ${monthsLabel(r.tier_months_to_pay)}`
                  : r?.selected_heads
                    ? `${r.selected_heads} heads • ${monthsLabel(r.months_to_pay)}`
                    : "—";

                return (
                  <tr key={r.contract_id}>
                    <Td className="max-w-[320px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {r.farmer_name || r.farmer_id}
                        </span>
                        <span className="text-xs text-gray-500">{r.farmer_phone || ""}</span>
                      </div>
                    </Td>

                    <Td className="max-w-[340px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {r.plan_title || serviceTypeLabel(r.service_type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {serviceTypeLabel(r.service_type)}
                        </span>
                      </div>
                    </Td>

                    <Td>{tierLabel}</Td>

                    <Td>
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </Td>

                    <Td>{r.payment_model || "—"}</Td>

                    <Td className="font-semibold">₱{money(r.total_payable)}</Td>
                    <Td>₱{money(r.paid_to_date)}</Td>
                    <Td
                      className={
                        Number(r.balance_due || 0) > 0
                          ? "font-semibold text-red-600"
                          : "font-semibold text-green-700"
                      }
                    >
                      ₱{money(r.balance_due)}
                    </Td>

                    <Td>{fmtDateTime(r.created_at)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {/* ✅ Remove "No more results" button.
              Only show Load more when there are more rows. */}
          {canLoadMore ? (
            <div className="mt-4 flex items-center justify-end">
              <Button
                variant="secondary"
                onClick={() => loadData(page + 1, true)}
                disabled={loading}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
