import React, { useEffect, useMemo, useState } from "react";

const PLAN_META = {
  rtl_feeds: { title: "Chickens (RTL) + Feeds" },
  feeds_only: { title: "Feeds Only" },
  rtl_only: { title: "Chickens (RTL) Only" },
};

function monthsLabel(m) {
  if (!m) return "—";
  if (m === 12) return "1 year";
  if (m === 18) return "1.5 years";
  if (m === 24) return "2 years";
  if (m % 12 === 0) return `${m / 12} years`;
  return `${m} months`;
}

function uniqSortedNums(arr) {
  return Array.from(new Set(arr.filter((n) => Number.isFinite(n)))).sort((a, b) => a - b);
}

function parseCsvNumbers(s) {
  return uniqSortedNums(
    String(s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n) && n > 0)
  );
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

function ModalShell({ open, title, children, onClose, footer }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>

        {footer ? <div className="border-t border-gray-100 p-4">{footer}</div> : null}
      </div>
    </div>
  );
}

/* -------------------------------- Component -------------------------------- */

export default function EditServicePlanModal({ open, onClose, plan, onSave }) {
  const [editErr, setEditErr] = useState(null);

  const [editDefault, setEditDefault] = useState("rtl_feeds");
  const [editHeadsCsv, setEditHeadsCsv] = useState("45,60,100,120");
  const [editMonthsCsv, setEditMonthsCsv] = useState("3,6,12,18,24");
  const [editKgCsv, setEditKgCsv] = useState("25,50,75");

  // ✅ NEW: normal input (NOT options)
  const [editRtlAgeWeeks, setEditRtlAgeWeeks] = useState("18");

  // ✅ when modal opens, preload values from plan
  useEffect(() => {
    if (!open) return;
    setEditErr(null);

    setEditDefault(plan?.default_plan || "rtl_feeds");
    setEditHeadsCsv((plan?.chicken_heads_options || [45, 60, 100, 120]).join(","));
    setEditMonthsCsv((plan?.feed_months_options || [3, 6, 12, 18, 24]).join(","));
    setEditKgCsv((plan?.feed_kg_options || [25, 50, 75]).join(","));

    // ✅ default age weeks (single value)
    setEditRtlAgeWeeks(
      plan?.rtl_age_weeks != null ? String(plan.rtl_age_weeks) : "18"
    );
  }, [open, plan]);

  const preview = useMemo(() => {
    const heads = parseCsvNumbers(editHeadsCsv);
    const months = parseCsvNumbers(editMonthsCsv);
    const kgs = parseCsvNumbers(editKgCsv);
    const age = Number(editRtlAgeWeeks);

    return {
      title: PLAN_META[editDefault]?.title ?? editDefault,
      heads,
      months,
      kgs,
      rtl_age_weeks: Number.isFinite(age) ? age : null,
    };
  }, [editDefault, editHeadsCsv, editMonthsCsv, editKgCsv, editRtlAgeWeeks]);

  function handleSave() {
    setEditErr(null);

    const heads = parseCsvNumbers(editHeadsCsv).map((n) => Math.round(n));
    const months = parseCsvNumbers(editMonthsCsv).map((n) => Math.round(n));
    const kgs = parseCsvNumbers(editKgCsv);
    const age = Number(editRtlAgeWeeks);

    if (months.some((m) => m > 24))
      return setEditErr("Months of feeds supply options cannot exceed 24 months (2 years).");
    if (heads.length === 0) return setEditErr("Please provide at least one chicken heads option.");
    if (months.length === 0) return setEditErr("Please provide at least one months-of-supply option.");
    if (kgs.length === 0) return setEditErr("Please provide at least one feed kg option.");

    // ✅ validate age weeks (single input)
    if (!Number.isFinite(age) || age < 1 || age > 200) {
      return setEditErr("Chickens (RTL) age (weeks) must be 1–200.");
    }

    onSave?.({
      default_plan: editDefault,
      chicken_heads_options: heads,
      feed_months_options: months,
      feed_kg_options: kgs,

      // ✅ NEW field (single value)
      rtl_age_weeks: Math.round(age),

      updated_at: new Date().toISOString(),
    });

    onClose?.();
  }

  return (
    <ModalShell
      open={open}
      title="Edit Service Plan"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            Use comma-separated values. Months max is <b>24</b>.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </div>
      }
    >
      {editErr ? (
        <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {editErr}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Default plan"
          value={editDefault}
          onChange={setEditDefault}
          options={[
            { value: "rtl_feeds", label: "Chickens (RTL) + Feeds (default)" },
            { value: "feeds_only", label: "Feeds only" },
            { value: "rtl_only", label: "Chickens (RTL) only" },
          ]}
        />

        {/* ✅ NEW: normal age input */}
        <Input
          label="Chickens (RTL) age (weeks)"
          type="number"
          min="1"
          max="200"
          placeholder="e.g. 18"
          value={editRtlAgeWeeks}
          onChange={(e) => setEditRtlAgeWeeks(e.target.value)}
        />

        <Input
          label="Chicken heads options"
          placeholder="45,60,100,120"
          value={editHeadsCsv}
          onChange={(e) => setEditHeadsCsv(e.target.value)}
        />

        <Input
          label="Months of feeds supply options (max 24)"
          placeholder="3,6,12,18,24"
          value={editMonthsCsv}
          onChange={(e) => setEditMonthsCsv(e.target.value)}
        />

        <Input
          label="Feed kg options"
          placeholder="25,50,75"
          value={editKgCsv}
          onChange={(e) => setEditKgCsv(e.target.value)}
        />

        {/* Preview (kept simple) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3 text-sm md:col-span-2">
          <div className="font-bold text-gray-900">Preview</div>
          <div className="mt-2 space-y-1 text-gray-700">
            <div>
              <b>Default:</b> {preview.title}
            </div>
            <div>
              <b>RTL age (weeks):</b> {preview.rtl_age_weeks ?? "—"}
            </div>
            <div>
              <b>Heads:</b> {preview.heads.join(", ") || "—"}
            </div>
            <div>
              <b>Months of feeds supply:</b> {preview.months.map(monthsLabel).join(", ") || "—"}
            </div>
            <div>
              <b>Feed kg:</b> {preview.kgs.join(", ") || "—"}
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
