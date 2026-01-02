import React, { useEffect, useMemo, useState } from "react";
import AddAvailmentModal from "@/components/admin/modals/AddAvailmentModal";
import EditServicePlanModal from "@/components/admin/modals/EditServicePlanModal";

const PLAN_META = {
  rtl_feeds: {
    title: "Chickens (RTL) + Feeds",
    desc: "Coop supplies RTL chickens plus feeds package under an agreed payment term.",
  },
  feeds_only: {
    title: "Feeds Only",
    desc: "Coop supplies feeds package only under an agreed payment term.",
  },
  rtl_only: {
    title: "Chickens (RTL) Only",
    desc: "Coop supplies RTL chickens only under an agreed payment term.",
  },
};

function monthsLabel(m) {
  if (!m) return "—";
  if (m === 12) return "1 year";
  if (m === 18) return "1.5 years";
  if (m === 24) return "2 years";
  if (m % 12 === 0) return `${m / 12} years`;
  return `${m} months`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString();
}

/* ----------------------------- Small UI bits ----------------------------- */

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
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <input
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400 ${className}`}
        {...props}
      />
    </label>
  );
}

function Select({ label, value, onChange, options, className = "" }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400 ${className}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
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

/* ---------------------------------- Page ---------------------------------- */

export default function CoopServicePlanPage() {
  const [plan, setPlan] = useState({
    admin_id: "mock-admin-uuid",
    default_plan: "rtl_feeds",
    chicken_heads_options: [45, 60, 100, 120],
    feed_months_options: [3, 6, 12, 18, 24],
    feed_kg_options: [25, 50, 75],
    updated_at: new Date().toISOString(),
  });

  const [availments, setAvailments] = useState(() => [
    {
      availment_id: 1,
      admin_id: "mock-admin-uuid",
      farmer_id: "farmer-uuid-1",
      farmer_name: "Juan Dela Cruz",
      farmer_contact: "0917-123-4567",
      plan_key: "rtl_feeds",
      chicken_heads: 60,
      feed_type: "Layer 1",
      feed_months: 12,
      feed_kg: 50,
      availed_at: "2025-12-10T10:00:00.000Z",
      pay_term_months: 12,
      pay_start_date: "2025-12-10",
      pay_due_date: "2026-12-10",
      status: "active",
      notes: "Monthly deduction from earnings.",
    },
    {
      availment_id: 2,
      admin_id: "mock-admin-uuid",
      farmer_id: "farmer-uuid-2",
      farmer_name: "Maria Santos",
      farmer_contact: "0922-555-0001",
      plan_key: "feeds_only",
      chicken_heads: null,
      feed_type: "Pellet",
      feed_months: 6,
      feed_kg: 25,
      availed_at: "2025-11-15T10:00:00.000Z",
      pay_term_months: 6,
      pay_start_date: "2025-11-15",
      pay_due_date: "2026-05-15",
      status: "completed",
      notes: "Paid early.",
    },
    {
      availment_id: 3,
      admin_id: "mock-admin-uuid",
      farmer_id: "farmer-uuid-3",
      farmer_name: "Pedro Ramirez",
      farmer_contact: "0933-888-1212",
      plan_key: "rtl_only",
      chicken_heads: 100,
      feed_type: null,
      feed_months: null,
      feed_kg: null,
      availed_at: "2025-12-20T10:00:00.000Z",
      pay_term_months: 18,
      pay_start_date: "2025-12-20",
      pay_due_date: "2027-06-20",
      status: "active",
      notes: "RTL only (no feeds).",
    },
  ]);

  // ✅ Add Availment Modal
  const [addOpen, setAddOpen] = useState(false);

  function handleAddAvailment(payload) {
    setAvailments((prev) => {
      const nextId = (prev.reduce((m, r) => Math.max(m, r.availment_id || 0), 0) || 0) + 1;
      return [{ ...payload, availment_id: nextId }, ...prev];
    });
  }

  // ✅ Edit Service Plan Modal
  const [editOpen, setEditOpen] = useState(false);

  function handleSavePlan(nextSettings) {
    setPlan((p) => ({
      ...p,
      ...nextSettings,
    }));
  }

  /* ----------------------------- Filters ----------------------------- */
  const [filters, setFilters] = useState({
    q: "",
    plan: "all",
    status: "all",
    feedType: "all",
    dateFrom: "",
    dateTo: "",
  });

  const feedTypeOptions = useMemo(() => {
    const base = ["Layer 1", "Layer 2", "Pellet", "Starter", "Grower", "Other"];
    const fromData = availments.map((a) => a.feed_type).filter(Boolean);
    return Array.from(new Set([...base, ...fromData]));
  }, [availments]);

  const filteredRows = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();

    return availments.filter((r) => {
      if (filters.plan !== "all" && r.plan_key !== filters.plan) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;

      if (filters.feedType !== "all") {
        if (!r.feed_type) return false;
        if (r.feed_type !== filters.feedType) return false;
      }

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom + "T00:00:00");
        if (new Date(r.availed_at) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo + "T23:59:59");
        if (new Date(r.availed_at) > to) return false;
      }

      if (q) {
        const hay = `${r.farmer_name || ""} ${r.farmer_contact || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [availments, filters]);

  /* ----------------------------- Pagination ---------------------------- */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const total = filteredRows.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, maxPage);

  useEffect(() => {
    setPage(1);
  }, [filters.plan, filters.status, filters.feedType, filters.dateFrom, filters.dateTo, filters.q, pageSize]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  const showing = useMemo(() => {
    if (total === 0) return { from: 0, to: 0 };
    const from = (safePage - 1) * pageSize + 1;
    const to = Math.min(safePage * pageSize, total);
    return { from, to };
  }, [safePage, pageSize, total]);

  /* ----------------------------- Service plan cards -------------------------- */
  const planCards = useMemo(() => {
    return Object.keys(PLAN_META).map((k) => {
      const isDefault = k === plan.default_plan;

      const headsText = `${plan.chicken_heads_options.join(", ")} heads`;
      const feedsText = `${plan.feed_months_options.map(monthsLabel).join(", ")} • kg options: ${plan.feed_kg_options.join(", ")}`;

      return {
        key: k,
        isDefault,
        title: PLAN_META[k].title,
        desc: PLAN_META[k].desc,
        headsText,
        feedsText,
      };
    });
  }, [plan]);

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      {/* Service Options */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Service Options</h2>
            <p className="text-sm text-gray-600">
              Default plan is highlighted (recommended plan shown to farmers).
            </p>
          </div>

          <Button variant="primary" onClick={() => setEditOpen(true)}>
            Edit service plan
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {planCards.map((c) => (
            <div
              key={c.key}
              className={`rounded-2xl border p-4 shadow-sm ${
                c.isDefault ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-base font-extrabold text-gray-900">{c.title}</div>
                {c.isDefault ? <Badge tone="warn">Default</Badge> : <Badge>Option</Badge>}
              </div>

              <div className="text-sm text-gray-600">{c.desc}</div>

              <div className="mt-4 space-y-2 text-sm">
                {/* Feeds only: remove Chickens row */}
                {c.key !== "feeds_only" ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-gray-800">Chickens:</div>
                    <div className="text-right text-gray-700">{c.headsText}</div>
                  </div>
                ) : null}

                {/* RTL only: remove Feeds row */}
                {c.key !== "rtl_only" ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-gray-800">Feeds:</div>
                    <div className="text-right text-gray-700">{c.feedsText}</div>
                  </div>
                ) : null}
              </div>

              {c.isDefault ? (
                <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700">
                  This is the default recommended plan.
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Last updated: <span className="font-semibold text-gray-700">{fmtDate(plan.updated_at)}</span>
        </div>
      </div>

      {/* Section header */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Farmers who availed</h2>
          <p className="text-sm text-gray-600">
            Includes date availed, payment term, due date, and filters.
          </p>
        </div>

        <Button variant="secondary" onClick={() => setAddOpen(true)}>
          + Add availment
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-6">
        <Input
          label="Search farmer"
          placeholder="Name / contact no…"
          value={filters.q}
          onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
        />

        <Select
          label="Plan"
          value={filters.plan}
          onChange={(v) => setFilters((s) => ({ ...s, plan: v }))}
          options={[
            { value: "all", label: "All plans" },
            { value: "rtl_feeds", label: "Chickens (RTL) + Feeds" },
            { value: "feeds_only", label: "Feeds only" },
            { value: "rtl_only", label: "Chickens (RTL) only" },
          ]}
        />

        <Select
          label="Feed Type"
          value={filters.feedType}
          onChange={(v) => setFilters((s) => ({ ...s, feedType: v }))}
          options={[
            { value: "all", label: "All feed types" },
            ...feedTypeOptions.map((t) => ({ value: t, label: t })),
          ]}
        />

        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((s) => ({ ...s, status: v }))}
          options={[
            { value: "all", label: "All status" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />

        <Input
          label="Availed from"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters((s) => ({ ...s, dateFrom: e.target.value }))}
        />

        <Input
          label="Availed to"
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters((s) => ({ ...s, dateTo: e.target.value }))}
        />
      </div>

      {/* Table */}
      <div className="mt-4">
        <Table>
          <thead>
            <tr>
              <Th>Farmer</Th>
              <Th>Plan</Th>
              <Th>Heads</Th>
              <Th>Feed Type</Th>
              <Th>Feeds</Th>
              <Th>Date availed</Th>
              <Th>Pay term</Th>
              <Th>Due date</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <Td>
                  <div className="py-6 text-sm text-gray-600">No availments found.</div>
                </Td>
                <Td /> <Td /> <Td /> <Td /> <Td /> <Td /> <Td /> <Td /> <Td />
              </tr>
            ) : (
              pageRows.map((r) => {
                const heads = r.plan_key === "feeds_only" ? "—" : `${r.chicken_heads ?? "?"}`;

                const feeds =
                  r.plan_key === "rtl_only"
                    ? "—"
                    : `${r.feed_type || "Other"} • ${r.feed_kg ?? "?"} kg • ${monthsLabel(r.feed_months)}`;

                const feedTypeCell = r.plan_key === "rtl_only" ? "—" : r.feed_type || "Other";

                const tone =
                  r.status === "active" ? "good" : r.status === "completed" ? "neutral" : "danger";

                return (
                  <tr key={r.availment_id}>
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-semibold">{r.farmer_name}</span>
                        <span className="text-xs text-gray-500">{r.farmer_contact}</span>
                      </div>
                    </Td>
                    <Td>{PLAN_META[r.plan_key]?.title ?? r.plan_key}</Td>
                    <Td>{heads}</Td>
                    <Td>{feedTypeCell}</Td>
                    <Td>{feeds}</Td>
                    <Td>{fmtDate(r.availed_at)}</Td>
                    <Td>{monthsLabel(r.pay_term_months)}</Td>
                    <Td>{r.pay_due_date || "—"}</Td>
                    <Td>
                      <Badge tone={tone}>{r.status}</Badge>
                    </Td>
                    <Td className="max-w-[260px]">
                      <span className="truncate block">{r.notes || "—"}</span>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>

        {/* Footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{showing.from}</span>–{" "}
            <span className="font-semibold text-gray-900">{showing.to}</span> of{" "}
            <span className="font-semibold text-gray-900">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v))}
              options={[
                { value: "10", label: "10 / page" },
                { value: "25", label: "25 / page" },
                { value: "50", label: "50 / page" },
              ]}
            />

            <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
              Prev
            </Button>

            <div className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
              Page <span className="font-semibold">{safePage}</span> /{" "}
              <span className="font-semibold">{maxPage}</span>
            </div>

            <Button variant="ghost" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={safePage >= maxPage}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Edit Service Plan Modal (separated file) */}
      <EditServicePlanModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        plan={plan}
        onSave={handleSavePlan}
      />

      {/* ✅ Add Availment Modal (already separated file) */}
      <AddAvailmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddAvailment}
        adminId={plan.admin_id}
        chickenHeadsOptions={plan.chicken_heads_options}
        feedMonthsOptions={plan.feed_months_options}
        feedKgOptions={plan.feed_kg_options}
        feedTypeOptions={feedTypeOptions}
      />
    </div>
  );
}
