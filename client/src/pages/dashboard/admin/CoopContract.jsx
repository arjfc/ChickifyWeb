import React, { useMemo, useState } from "react";

/**
 * UI-FIRST + DB-FRIENDLY MOCK IMPLEMENTATION
 * Coop/Admin Contract Settings Page
 *
 * Later DB table shape suggestion:
 * coop_contract_settings
 * {
 *   admin_id: uuid,
 *   membership_fee: numeric,
 *   contract_body: text,
 *   services: {
 *     rtl_chickens: boolean,
 *     feeds: boolean,
 *     vet_support: boolean,
 *     pickup_support: boolean,
 *     training_support: boolean
 *   },
 *   instructions: text,
 *   payment: {
 *     mode: "deduct_earnings" | "cash" | "paypal" | "mixed",
 *     default_pay_term_months: int,
 *     grace_days: int,
 *     require_membership_before_service: boolean,
 *     late_fee_note: text
 *   },
 *   updated_at: timestamptz
 * }
 */

function php(n) {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `₱${num.toFixed(2)}`;
  }
}

function monthsLabel(m) {
  const n = Number(m);
  if (!n) return "—";
  if (n === 12) return "1 year";
  if (n === 18) return "1.5 years";
  if (n === 24) return "2 years";
  if (n % 12 === 0) return `${n / 12} years`;
  return `${n} months`;
}

/* ----------------------------- Small UI bits ----------------------------- */

function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-300",
    secondary: "bg-gray-900 text-white hover:bg-gray-800",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Input({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <input
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400 disabled:bg-gray-100 disabled:text-gray-600 ${className}`}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </label>
  );
}

function TextArea({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <textarea
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400 disabled:bg-gray-100 disabled:text-gray-600 ${className}`}
        {...props}
      />
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </label>
  );
}

function Select({ label, value, onChange, options, hint, className = "", disabled }) {
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
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label className={`flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 ${disabled ? "opacity-60" : ""}`}>
      <input
        type="checkbox"
        className="h-4 w-4 accent-yellow-400"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="text-sm font-semibold text-gray-800">{label}</span>
    </label>
  );
}

function HintBox({ children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
      {children}
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function CoopContractSettingsPage() {
  // Mock DB record
  const [data, setData] = useState({
    admin_id: "mock-admin-uuid",
    membership_fee: 1500,
    contract_body:
      "By availing the coop service plan, the farmer agrees to repay based on the selected payment term. The coop may deduct repayments from farmer earnings (if applicable). The farmer commits to proper poultry care, accurate reporting, and timely cooperation for pickups and deliveries.\n\nViolation of agreed terms may result in suspension of services.",
    services: {
      rtl_chickens: true,
      feeds: true,
      vet_support: true,
      pickup_support: true,
      training_support: false,
    },
    instructions:
      "• Keep records updated (egg count, expenses, flock status).\n• Follow coop feed program.\n• Report health issues immediately.\n• Be available during scheduled pickups.",
    payment: {
      mode: "deduct_earnings", // deduct_earnings | cash | paypal | mixed
      default_pay_term_months: 12,
      grace_days: 7,
      require_membership_before_service: true,
      late_fee_note: "Late payments may affect future approvals and service eligibility.",
    },
    updated_at: new Date().toISOString(),
  });

  // Edit mode for Contract Body (main request)
  const [editContract, setEditContract] = useState(false);
  const [draftContract, setDraftContract] = useState(data.contract_body);

  // Optional: edit mode for the whole settings (so you can tweak other cards too)
  const [editSettings, setEditSettings] = useState(false);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(data)));

  const payTermOptions = useMemo(
    () => [
      { value: "3", label: monthsLabel(3) },
      { value: "6", label: monthsLabel(6) },
      { value: "12", label: monthsLabel(12) },
      { value: "18", label: monthsLabel(18) },
      { value: "24", label: monthsLabel(24) },
    ],
    []
  );

  const paymentModeOptions = useMemo(
    () => [
      { value: "deduct_earnings", label: "Deduct from earnings" },
      { value: "cash", label: "Cash" },
      { value: "paypal", label: "PayPal" },
      { value: "mixed", label: "Mixed (case-by-case)" },
    ],
    []
  );

  function resetDraftFromData() {
    setDraft(JSON.parse(JSON.stringify(data)));
  }

  function openEditSettings() {
    resetDraftFromData();
    setEditSettings(true);
  }

  function cancelEditSettings() {
    setEditSettings(false);
    resetDraftFromData();
  }

  function saveEditSettings() {
    // Minimal validation (DB-friendly)
    const fee = Number(draft.membership_fee);
    if (!Number.isFinite(fee) || fee < 0) {
      alert("Membership fee must be a valid number.");
      return;
    }

    const grace = Number(draft.payment.grace_days);
    if (!Number.isFinite(grace) || grace < 0 || grace > 60) {
      alert("Grace days must be 0–60.");
      return;
    }

    const term = Number(draft.payment.default_pay_term_months);
    if (!Number.isFinite(term) || term < 1 || term > 24) {
      alert("Default pay term must be 1–24 months.");
      return;
    }

    setData((prev) => ({
      ...prev,
      ...draft,
      updated_at: new Date().toISOString(),
    }));
    setEditSettings(false);
  }

  function openEditContract() {
    setDraftContract(data.contract_body || "");
    setEditContract(true);
  }

  function cancelEditContract() {
    setEditContract(false);
    setDraftContract(data.contract_body || "");
  }

  function saveEditContract() {
    const body = String(draftContract || "").trim();
    if (!body) {
      alert("Contract text cannot be empty.");
      return;
    }
    setData((prev) => ({
      ...prev,
      contract_body: body,
      updated_at: new Date().toISOString(),
    }));
    setEditContract(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
        {/* Top header row (buttons on the right) */}
        <div className="mb-5 flex flex-wrap justify-end gap-2">
        {editSettings ? (
            <>
            <Button variant="ghost" onClick={cancelEditSettings}>
                Cancel
            </Button>
            <Button variant="primary" onClick={saveEditSettings}>
                Save settings
            </Button>
            </>
        ) : (
            <Button variant="primary" onClick={openEditSettings}>
            Edit contract settings
            </Button>
        )}
        </div>

      {/* Layout */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* LEFT: Contract Body */}
        <div className="lg:col-span-2 space-y-5">
          <Card
            title="Contract / Agreement Text"
            subtitle="This appears as the coop’s official agreement text. Default: read-only."
            right={
              editContract ? (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={cancelEditContract}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={saveEditContract}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={openEditContract}>
                  Edit text
                </Button>
              )
            }
          >
            <TextArea
              label=""
              rows={10}
              value={editContract ? draftContract : data.contract_body}
              onChange={(e) => setDraftContract(e.target.value)}
              disabled={!editContract}
              className="min-h-[220px]"
              hint={
                editContract
                  ? "Editing enabled. Keep it short, clear, and enforceable."
                  : "Read-only. Click “Edit text” to modify."
              }
            />

            <div className="mt-3 text-xs text-gray-500">
              Last updated:{" "}
              <span className="font-semibold text-gray-700">
                {new Date(data.updated_at).toLocaleString()}
              </span>
            </div>
          </Card>

          {/* Instructions Card */}
          <Card
            title="Instructions for Farmers"
            subtitle="Shown during onboarding / when availing a service plan."
          >
            <TextArea
              label="Instructions"
              rows={6}
              value={editSettings ? draft.instructions : data.instructions}
              disabled={!editSettings}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  instructions: e.target.value,
                }))
              }
              hint="Tip: use bullet points. Keep it readable."
            />
          </Card>
        </div>

        {/* RIGHT: Membership + Services + Payment */}
        <div className="space-y-5">
          <Card title="Membership Fee" subtitle="One-time or required before activation.">
            <div className="grid gap-3">
              <Input
                label="Membership fee (PHP)"
                type="number"
                min="0"
                step="0.01"
                value={editSettings ? draft.membership_fee : data.membership_fee}
                disabled={!editSettings}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    membership_fee: e.target.value,
                  }))
                }
                hint={`Preview: ${php(editSettings ? draft.membership_fee : data.membership_fee)}`}
              />

              <Toggle
                label="Require membership before service activation"
                checked={
                  editSettings
                    ? draft.payment.require_membership_before_service
                    : data.payment.require_membership_before_service
                }
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    payment: { ...s.payment, require_membership_before_service: v },
                  }))
                }
              />
            </div>
          </Card>

          <Card title="Services Provided" subtitle="These appear in your coop contract summary.">
            <div className="grid gap-2">
              <Toggle
                label="RTL Chickens supply"
                checked={editSettings ? draft.services.rtl_chickens : data.services.rtl_chickens}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    services: { ...s.services, rtl_chickens: v },
                  }))
                }
              />
              <Toggle
                label="Feeds supply"
                checked={editSettings ? draft.services.feeds : data.services.feeds}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    services: { ...s.services, feeds: v },
                  }))
                }
              />
              <Toggle
                label="Vet / health support"
                checked={editSettings ? draft.services.vet_support : data.services.vet_support}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    services: { ...s.services, vet_support: v },
                  }))
                }
              />
              <Toggle
                label="Pickup support (coop coordination)"
                checked={editSettings ? draft.services.pickup_support : data.services.pickup_support}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    services: { ...s.services, pickup_support: v },
                  }))
                }
              />
              <Toggle
                label="Training / orientation support"
                checked={editSettings ? draft.services.training_support : data.services.training_support}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    services: { ...s.services, training_support: v },
                  }))
                }
              />

              <HintBox>
                Keep services aligned with your actual service plan offerings (RTL+Feeds / Feeds only / RTL only).
              </HintBox>
            </div>
          </Card>

          <Card title="Payment Settings" subtitle="Defaults used when farmers avail services.">
            <div className="grid gap-3">
              <Select
                label="Payment mode"
                value={editSettings ? draft.payment.mode : data.payment.mode}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    payment: { ...s.payment, mode: v },
                  }))
                }
                options={paymentModeOptions}
                hint="This is the default payment approach for the coop."
              />

              <Select
                label="Default pay term"
                value={String(
                  editSettings ? draft.payment.default_pay_term_months : data.payment.default_pay_term_months
                )}
                disabled={!editSettings}
                onChange={(v) =>
                  setDraft((s) => ({
                    ...s,
                    payment: { ...s.payment, default_pay_term_months: Number(v) },
                  }))
                }
                options={payTermOptions}
                hint="Farmers can still pick different terms (if you allow) later."
              />

              <Input
                label="Grace period (days)"
                type="number"
                min="0"
                max="60"
                value={editSettings ? draft.payment.grace_days : data.payment.grace_days}
                disabled={!editSettings}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    payment: { ...s.payment, grace_days: e.target.value },
                  }))
                }
                hint="Days allowed after due date before escalation."
              />

              <TextArea
                label="Late fee note / reminders"
                rows={3}
                value={editSettings ? draft.payment.late_fee_note : data.payment.late_fee_note}
                disabled={!editSettings}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    payment: { ...s.payment, late_fee_note: e.target.value },
                  }))
                }
                hint="Short message shown to farmers."
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
