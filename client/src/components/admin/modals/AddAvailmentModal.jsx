import React, { useMemo, useState } from "react";
import SearchSelect from "@/components/admin/SearchSelect";

const PLAN_META = {
  rtl_feeds: { title: "Chickens (RTL) + Feeds" },
  feeds_only: { title: "Feeds Only" },
  rtl_only: { title: "Chickens (RTL) Only" },
};

function addMonthsToDate(yyyyMMdd, monthsToAdd) {
  const [y, m, d] = yyyyMMdd.split("-").map(Number);
  const dt = new Date(y, (m - 1) + Number(monthsToAdd), d);

  const targetMonthIndex = (m - 1) + Number(monthsToAdd);
  const expectedMonth = ((targetMonthIndex % 12) + 12) % 12;

  if (dt.getMonth() !== expectedMonth) dt.setDate(0);

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function monthsLabel(m) {
  if (!m) return "—";
  if (m === 12) return "1 year";
  if (m === 18) return "1.5 years";
  if (m === 24) return "2 years";
  if (m % 12 === 0) return `${m / 12} years`;
  return `${m} months`;
}

function todayYmd() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

function Select({ label, value, onChange, options, className = "", disabled }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400 disabled:bg-gray-100 disabled:text-gray-600 ${className}`}
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
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

function Hint({ children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
      {children}
    </div>
  );
}

/* ------------------- Auto map months -> kg (DB-friendly) ------------------- */
function computeKgFromMonths(months, feedMonthsOptions, feedKgOptions) {
  const m = Number(months);
  if (!Number.isFinite(m) || m <= 0) return "";

  const monthsArr = [...(feedMonthsOptions || [])].map(Number).filter(Boolean).sort((a, b) => a - b);
  const kgArr = [...(feedKgOptions || [])].map(Number).filter(Boolean).sort((a, b) => a - b);

  if (monthsArr.length === 0 || kgArr.length === 0) return "";

  const nearestIdx = monthsArr.reduce((best, val, idx) => {
    const bestDiff = Math.abs(monthsArr[best] - m);
    const diff = Math.abs(val - m);
    return diff < bestDiff ? idx : best;
  }, 0);

  if (monthsArr.length === kgArr.length) {
    return String(kgArr[nearestIdx] ?? kgArr[0]);
  }

  const minM = monthsArr[0];
  const maxM = monthsArr[monthsArr.length - 1];
  const t = maxM === minM ? 0 : (monthsArr[nearestIdx] - minM) / (maxM - minM);
  const kgIndex = Math.round(t * (kgArr.length - 1));
  return String(kgArr[Math.max(0, Math.min(kgArr.length - 1, kgIndex))]);
}

/* -------------------------------- Component -------------------------------- */

export default function AddAvailmentModal({
  open,
  onClose,
  onAdd,
  adminId = "mock-admin-uuid",

  chickenHeadsOptions = [45, 60, 100, 120],
  feedKgOptions = [25, 50, 75],
  feedMonthsOptions = [3, 6, 12, 18, 24],
  feedTypeOptions = ["Layer 1", "Layer 2", "Pellet", "Starter", "Grower", "Other"],
}) {
  const today = useMemo(() => todayYmd(), []);
  const [err, setErr] = useState(null);

  // ✅ mock farmer list (replace with DB later)
  const farmerOptions = useMemo(
    () => [
      { value: "farmer-uuid-1", label: "Juan Dela Cruz",  },
      { value: "farmer-uuid-2", label: "Maria Santos", },
      { value: "farmer-uuid-3", label: "Pedro Ramirez", },
    ],
    []
  );

  const [form, setForm] = useState({
    farmer_id: "",
    farmer_name: "",
    farmer_contact: "",
    plan_key: "rtl_feeds",

    chicken_heads: "",
    feed_type: "Layer 1",
    feed_type_other: "",
    feed_months: "",
    feed_kg: "",

    availed_date: today,
    pay_term_months: "12",
    pay_start_date: today,

    notes: "",
  });

  const includesChickens = form.plan_key !== "feeds_only";
  const includesFeeds = form.plan_key !== "rtl_only";

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function setPlanKey(next) {
    setForm((s) => {
      const nextState = { ...s, plan_key: next };

      if (next === "feeds_only") {
        nextState.chicken_heads = "";
      }

      if (next === "rtl_only") {
        nextState.feed_type = "Layer 1";
        nextState.feed_type_other = "";
        nextState.feed_months = "";
        nextState.feed_kg = "";
      }

      return nextState;
    });
  }

  const resolvedFeedType = useMemo(() => {
    if (!includesFeeds) return null;
    if (form.feed_type === "Other") return (form.feed_type_other || "").trim() || "Other";
    return form.feed_type;
  }, [form.feed_type, form.feed_type_other, includesFeeds]);

  const dueDate = useMemo(() => {
    const term = Number(form.pay_term_months || 0);
    if (!form.pay_start_date || !term) return "";
    return addMonthsToDate(form.pay_start_date, term);
  }, [form.pay_start_date, form.pay_term_months]);

  function reset() {
    setErr(null);
    setForm({
      farmer_id: "",
      farmer_name: "",
      farmer_contact: "",
      plan_key: "rtl_feeds",

      chicken_heads: "",
      feed_type: "Layer 1",
      feed_type_other: "",
      feed_months: "",
      feed_kg: "",

      availed_date: today,
      pay_term_months: "12",
      pay_start_date: today,

      notes: "",
    });
  }

  function validate() {
    if (!(form.farmer_id || "").trim()) return "Select a farmer.";

    const term = Number(form.pay_term_months);
    if (!Number.isFinite(term) || term < 1 || term > 24) return "Pay term must be 1–24 months.";

    if (!form.availed_date) return "Availed date is required.";
    if (!form.pay_start_date) return "Pay start date is required.";

    if (includesChickens) {
      const heads = Number(form.chicken_heads);
      if (!Number.isFinite(heads) || heads <= 0) return "Select chicken heads.";
    }

    if (includesFeeds) {
      const months = Number(form.feed_months);
      const kg = Number(form.feed_kg);

      if (!resolvedFeedType) return "Feed type is required.";
      if (!Number.isFinite(months) || months <= 0 || months > 24) return "Select months of feeds supply.";
      if (!Number.isFinite(kg) || kg <= 0) return "Feeds kg auto-fill failed. Check options.";
    }

    return null;
  }

  function handleSubmit() {
    const msg = validate();
    if (msg) return setErr(msg);

    const payload = {
      admin_id: adminId,

      farmer_id: form.farmer_id,
      farmer_name: form.farmer_name.trim(),
      farmer_contact: form.farmer_contact.trim() || null,

      plan_key: form.plan_key,

      chicken_heads: includesChickens ? Number(form.chicken_heads) : null,
      feed_type: includesFeeds ? resolvedFeedType : null,
      feed_months: includesFeeds ? Number(form.feed_months) : null,
      feed_kg: includesFeeds ? Number(form.feed_kg) : null,

      availed_at: new Date(form.availed_date + "T10:00:00.000Z").toISOString(),

      pay_term_months: Number(form.pay_term_months),
      pay_start_date: form.pay_start_date,
      pay_due_date: dueDate,

      status: "active",
      notes: form.notes.trim() || null,
    };

    onAdd?.(payload);
    reset();
    onClose?.();
  }

  const headsSelectOptions = useMemo(
    () => [{ value: "", label: "Select heads…" }, ...chickenHeadsOptions.map((n) => ({ value: String(n), label: `${n} heads` }))],
    [chickenHeadsOptions]
  );

  const monthsSelectOptions = useMemo(
    () => [{ value: "", label: "Select duration…" }, ...feedMonthsOptions.map((m) => ({ value: String(m), label: monthsLabel(m) }))],
    [feedMonthsOptions]
  );

  function onChangeFeedMonths(v) {
    const nextKg = computeKgFromMonths(v, feedMonthsOptions, feedKgOptions);
    setForm((s) => ({ ...s, feed_months: v, feed_kg: nextKg }));
  }

  return (
    <ModalShell
      open={open}
      title="Add Availment"
      onClose={() => {
        reset();
        onClose?.();
      }}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            Due date = <b>Pay start</b> + <b>Pay term</b>.
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                reset();
                onClose?.();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Add
            </Button>
          </div>
        </div>
      }
    >
      {err ? (
        <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {/* Row 1 */}
        <SearchSelect
          label="Farmer name"
          value={form.farmer_id}
          options={farmerOptions}
          placeholder="Select farmer..."
          onChange={(item) => {
            setForm((s) => ({
              ...s,
              farmer_id: item.value,
              farmer_name: item.label,
              farmer_contact: item.meta || "",
            }));
          }}
        />

        <Input
          label="Contact no. (optional)"
          placeholder="09xx-xxx-xxxx"
          value={form.farmer_contact}
          onChange={(e) => setField("farmer_contact", e.target.value)}
        />

        {/* Row 2 */}
        <Select
          label="Plan"
          value={form.plan_key}
          onChange={setPlanKey}
          options={[
            { value: "rtl_feeds", label: PLAN_META.rtl_feeds.title },
            { value: "feeds_only", label: PLAN_META.feeds_only.title },
            { value: "rtl_only", label: PLAN_META.rtl_only.title },
          ]}
        />

        <Input
          label="Pay term months (1–24)"
          type="number"
          min="1"
          max="24"
          value={form.pay_term_months}
          onChange={(e) => setField("pay_term_months", e.target.value)}
        />

        {/* Chickens */}
        {!includesChickens ? (
          <div className="md:col-span-2">
            <Hint>Chickens not included for <b>Feeds Only</b>.</Hint>
          </div>
        ) : (
          <Select
            label="Chicken heads"
            value={form.chicken_heads}
            onChange={(v) => setField("chicken_heads", v)}
            options={headsSelectOptions}
          />
        )}

        {/* Feeds */}
        {!includesFeeds ? (
          <div className="md:col-span-2">
            <Hint>Feeds not included for <b>Chickens (RTL) Only</b>.</Hint>
          </div>
        ) : (
          <>
            <Select
              label="Feed type"
              value={form.feed_type}
              onChange={(v) => setField("feed_type", v)}
              options={feedTypeOptions.map((t) => ({ value: t, label: t }))}
            />

            {form.feed_type === "Other" ? (
              <div className="md:col-span-2">
                <Input
                  label="Other feed type"
                  placeholder="e.g. Finisher, Pre-lay..."
                  value={form.feed_type_other}
                  onChange={(e) => setField("feed_type_other", e.target.value)}
                />
              </div>
            ) : null}

            <Select
              label="Months of feeds supply"
              value={form.feed_months}
              onChange={onChangeFeedMonths}
              options={monthsSelectOptions}
            />

            <Input
              label="Feeds kg (auto)"
              value={form.feed_kg ? `${form.feed_kg} kg` : ""}
              placeholder="Auto-filled"
              disabled
            />
          </>
        )}

        {/* Dates */}
        <Input
          label="Date availed"
          type="date"
          value={form.availed_date}
          onChange={(e) => setField("availed_date", e.target.value)}
        />

        <Input
          label="Pay start date"
          type="date"
          value={form.pay_start_date}
          onChange={(e) => setField("pay_start_date", e.target.value)}
        />

        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
          Due date: <b>{dueDate || "—"}</b>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-gray-700">Notes (optional)</div>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400"
              rows={3}
              placeholder="e.g. Monthly deduction from earnings..."
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
            />
          </label>
        </div>

        {/* ✅ Active checkbox (readonly) */}
        <div className="md:col-span-1 -mt-3 self-start flex items-center gap-2 px-3 py-1">
          <input type="checkbox" checked={true} className="h-4 w-4 accent-yellow-400" />
          <div className="text-sm font-semibold text-gray-800">Active Status</div>
        </div>
      </div>
    </ModalShell>
  );
}
