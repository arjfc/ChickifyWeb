// src/components/admin/modals/EditCoopServicePlanModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  updateServicePlan,
  upsertPlanTiers,
  deletePlanTiers,
  fetchTiersByPlanIds,
  replaceTierFeeds,
} from "@/services/coopServicePlan";

const modalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    borderRadius: 20,
    padding: 16,
    width: "min(1100px, 92vw)",
    maxHeight: "85vh",
    overflow: "auto",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000 },
};

function deepCopy(x) {
  return JSON.parse(JSON.stringify(x));
}

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

function Textarea({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-sm font-medium text-gray-700">{label}</div> : null}
      <textarea
        className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400 ${className}`}
        rows={4}
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

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </label>
  );
}

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computeTier(t) {
  const rtl = Number(t.rtl_cost || 0);
  const feeds = Number(t.feeds_cost || 0);
  const months = Number(t.months_to_pay || 0);

  const total = rtl + feeds;
  const monthly = months > 0 ? total / months : 0;

  return {
    ...t,
    total_cost: Number.isFinite(total) ? total : 0,
    est_monthly_ui: Number.isFinite(monthly) ? monthly : 0, // UI-only
  };
}

function makeTmpId(prefix = "tmp") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function EditCoopServicePlanModal({
  open,
  onClose,
  plans = [],
  tiersByPlan = {},
  tierFeedsByTier = {},
  feedTypes = [],
  onSaved,
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const planOptions = useMemo(
    () =>
      (plans || []).map((p) => ({
        value: String(p.plan_id),
        label: `${p.title || p.service_type} (plan #${p.plan_id})`,
      })),
    [plans]
  );

  const [activePlanId, setActivePlanId] = useState(planOptions?.[0]?.value || "");

  const [draftPlan, setDraftPlan] = useState(null);
  const [draftTiers, setDraftTiers] = useState([]);
  const [draftFeeds, setDraftFeeds] = useState({});

  useEffect(() => {
    if (!open) return;
    const first = planOptions?.[0]?.value || "";
    setActivePlanId((p) => p || first);
  }, [open, planOptions]);

  useEffect(() => {
    if (!open) return;
    if (!activePlanId) return;

    const planIdNum = Number(activePlanId);
    const p = plans.find((x) => Number(x.plan_id) === planIdNum);
    const tiers = tiersByPlan?.[planIdNum] || [];

    setErr("");
    setDraftPlan(p ? deepCopy(p) : null);

    const normalized = tiers.map((t) => ({
      ...deepCopy(t),
      __tmp: makeTmpId("tier"),
      __deleted: false,
    }));
    setDraftTiers(normalized.map(computeTier));

    const nextFeeds = {};
    for (const t of tiers) {
      const items = tierFeedsByTier?.[t.tier_id] || [];
      nextFeeds[String(t.tier_id)] = deepCopy(items).map((it) => ({
        feed_type_id: it.feed_type_id,
        est_feed_kg_month: it.est_feed_kg_month,
      }));
    }
    setDraftFeeds(nextFeeds);
  }, [open, activePlanId, plans, tiersByPlan, tierFeedsByTier]);

  const isFeedsOnly = draftPlan?.service_type === "feeds_only";
  const activePlanNum = Number(activePlanId || 0);

  function setTierField(idx, key, value) {
    setDraftTiers((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [key]: value };
      next[idx] = computeTier(row);
      return next;
    });
  }

  function addTier() {
    setDraftTiers((prev) => [
      computeTier({
        tier_id: null,
        plan_id: Number(activePlanId),
        heads: 0,
        est_feed_kg_month: 0,
        est_sacks_month: 0,
        rtl_cost: 0,
        feeds_cost: 0,
        total_cost: 0,
        months_to_pay: 12,
        __tmp: makeTmpId("tier"),
        __deleted: false,
      }),
      ...prev,
    ]);
  }

  function toggleDeleteTier(idx) {
    setDraftTiers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], __deleted: !next[idx].__deleted };
      return next;
    });
  }

  function addFeedRowForTier(tierId) {
    const key = String(tierId);
    setDraftFeeds((prev) => {
      const cur = prev[key] || [];
      return {
        ...prev,
        [key]: [...cur, { feed_type_id: feedTypes?.[0]?.feed_type_id ?? 0, est_feed_kg_month: 0 }],
      };
    });
  }

  function updateFeedRow(tierId, idx, patch) {
    const key = String(tierId);
    setDraftFeeds((prev) => {
      const arr = [...(prev[key] || [])];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [key]: arr };
    });
  }

  function removeFeedRow(tierId, idx) {
    const key = String(tierId);
    setDraftFeeds((prev) => {
      const arr = [...(prev[key] || [])];
      arr.splice(idx, 1);
      return { ...prev, [key]: arr };
    });
  }

  async function handleSave() {
    try {
      setSaving(true);
      setErr("");

      if (!draftPlan?.plan_id) throw new Error("No plan selected.");

      // 1) Update plan details (include feeds pricing for Option A)
      await updateServicePlan(draftPlan.plan_id, {
        title: draftPlan.title,
        description: draftPlan.description,
        is_recommended: !!draftPlan.is_recommended,
        is_active: !!draftPlan.is_active,

        // ✅ Option A fields (only meaningful for feeds_only)
        feed_price_per_kg:
          draftPlan.feed_price_per_kg === "" || draftPlan.feed_price_per_kg == null
            ? null
            : Number(draftPlan.feed_price_per_kg),
        sack_kg:
          draftPlan.sack_kg === "" || draftPlan.sack_kg == null ? 50 : Number(draftPlan.sack_kg),
      });

      // If Feeds Only, STOP HERE. No tier pricing / breakdown.
      if (isFeedsOnly) {
        onSaved?.();
        onClose?.();
        return;
      }

      // 2) Delete tiers marked deleted
      const toDeleteIds = draftTiers.filter((t) => t.__deleted && t.tier_id).map((t) => t.tier_id);
      if (toDeleteIds.length) await deletePlanTiers(toDeleteIds);

      // 3) Upsert tiers not deleted (ONLY DB columns)
      const upsertRows = draftTiers
        .filter((t) => !t.__deleted)
        .map((t) => ({
          tier_id: t.tier_id || null,
          plan_id: Number(activePlanId),
          heads: Number(t.heads || 0),
          est_feed_kg_month: Number(t.est_feed_kg_month || 0),
          est_sacks_month: Number(t.est_sacks_month || 0),
          rtl_cost: Number(t.rtl_cost || 0),
          feeds_cost: Number(t.feeds_cost || 0),
          total_cost: Number((Number(t.rtl_cost || 0) + Number(t.feeds_cost || 0)) || 0),
          months_to_pay: Number(t.months_to_pay || 0),
        }));

      await upsertPlanTiers(upsertRows);

      // 4) Refetch tiers to get tier_ids for newly inserted rows
      const refreshed = await fetchTiersByPlanIds([Number(activePlanId)]);

      function findTierIdByHeadsMonths(heads, months) {
        const h = Number(heads || 0);
        const m = Number(months || 0);
        const match = refreshed.find((x) => Number(x.heads) === h && Number(x.months_to_pay) === m);
        return match?.tier_id || null;
      }

      // 5) Save tier feed breakdown
      for (const t of draftTiers.filter((x) => !x.__deleted)) {
        const tierId = t.tier_id || findTierIdByHeadsMonths(t.heads, t.months_to_pay);
        if (!tierId) continue;

        const items = draftFeeds[String(t.tier_id)] || draftFeeds[String(tierId)] || [];
        await replaceTierFeeds(tierId, items);
      }

      onSaved?.();
      onClose?.();
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={open} onRequestClose={onClose} style={modalStyle} ariaHideApp={false}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">Coop Edit: Service Plan & Tiers</div>
          <div className="text-sm text-gray-600">Edit plan info, tier pricing, and configuration.</div>
        </div>

        <button
          className="rounded-xl p-2 text-gray-700 hover:bg-gray-100"
          onClick={onClose}
          disabled={saving}
          title="Close"
        >
          <FiX />
        </button>
      </div>

      {err ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Select
          label="Select plan"
          value={activePlanId}
          onChange={setActivePlanId}
          options={planOptions.length ? planOptions : [{ value: "", label: "No plans found" }]}
        />

        <div className="flex items-end justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !draftPlan}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Plan fields */}
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-extrabold text-gray-900">Plan details</div>
          <div className="text-xs text-gray-500">plan_id: {draftPlan?.plan_id ?? "—"}</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Title"
            value={draftPlan?.title ?? ""}
            onChange={(e) => setDraftPlan((p) => ({ ...p, title: e.target.value }))}
            disabled={!draftPlan}
          />
          <Input label="Service type" value={draftPlan?.service_type ?? ""} disabled />

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={draftPlan?.description ?? ""}
              onChange={(e) => setDraftPlan((p) => ({ ...p, description: e.target.value }))}
              disabled={!draftPlan}
            />
          </div>

          <Toggle
            label="Recommended (Default)"
            checked={!!draftPlan?.is_recommended}
            onChange={(v) => setDraftPlan((p) => ({ ...p, is_recommended: v }))}
          />
          <Toggle
            label="Active"
            checked={!!draftPlan?.is_active}
            onChange={(v) => setDraftPlan((p) => ({ ...p, is_active: v }))}
          />
        </div>

        {/* ✅ OPTION A: Feeds Only pricing block */}
        {isFeedsOnly ? (
          <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="text-sm font-extrabold text-gray-900">Feeds pricing (Feeds Only)</div>
            <div className="mt-1 text-xs text-gray-700">
              Farmers will input heads + age + months in mobile. Total cost is computed from feeding guide × price/kg.
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input
                label="Feeds price per kg (₱)"
                type="number"
                step="0.01"
                value={draftPlan?.feed_price_per_kg ?? ""}
                onChange={(e) => setDraftPlan((p) => ({ ...p, feed_price_per_kg: e.target.value }))}
                disabled={saving}
              />
              <Input
                label="Sack weight (kg)"
                type="number"
                step="0.01"
                value={draftPlan?.sack_kg ?? 50}
                onChange={(e) => setDraftPlan((p) => ({ ...p, sack_kg: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Tiers - hide for Feeds Only */}
      {!isFeedsOnly ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-gray-900">Tier plans</div>
              <div className="text-xs text-gray-600">heads + months + estimated feeds + costs. Total/monthly auto computed.</div>
            </div>

            <Button variant="secondary" onClick={addTier} disabled={!activePlanNum || saving}>
              <FiPlus className="mr-2" /> Add tier
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-600">
                  <th className="px-4 py-3">Heads</th>
                  <th className="px-4 py-3">Months</th>
                  <th className="px-4 py-3">Est feed kg/mo</th>
                  <th className="px-4 py-3">Est sacks/mo</th>
                  <th className="px-4 py-3">RTL cost</th>
                  <th className="px-4 py-3">Feeds cost</th>
                  <th className="px-4 py-3">Total cost</th>
                  <th className="px-4 py-3">Est / month</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {!draftTiers.length ? (
                  <tr>
                    <td className="px-4 py-5 text-gray-600" colSpan={9}>
                      No tiers found for this plan.
                    </td>
                  </tr>
                ) : (
                  draftTiers.map((t, idx) => {
                    const isDeleted = !!t.__deleted;
                    return (
                      <tr key={t.__tmp} className={isDeleted ? "opacity-50" : ""}>
                        <td className="border-t border-gray-100 px-4 py-2">
                          <input
                            type="number"
                            className="w-24 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                            value={t.heads ?? 0}
                            onChange={(e) => setTierField(idx, "heads", Number(e.target.value))}
                            disabled={saving}
                          />
                        </td>

                        <td className="border-t border-gray-100 px-4 py-2">
                          <input
                            type="number"
                            className="w-24 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                            value={t.months_to_pay ?? 0}
                            onChange={(e) => setTierField(idx, "months_to_pay", Number(e.target.value))}
                            disabled={saving}
                          />
                        </td>

                        <td className="border-t border-gray-100 px-4 py-2">
                          <input
                            type="number"
                            step="0.1"
                            className="w-32 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                            value={t.est_feed_kg_month ?? 0}
                            onChange={(e) => setTierField(idx, "est_feed_kg_month", Number(e.target.value))}
                            disabled={saving}
                          />
                        </td>

                        <td className="border-t border-gray-100 px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-28 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                            value={t.est_sacks_month ?? 0}
                            onChange={(e) => setTierField(idx, "est_sacks_month", Number(e.target.value))}
                            disabled={saving}
                          />
                        </td>

                        <td className="border-t border-gray-100 px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-32 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                            value={t.rtl_cost ?? 0}
                            onChange={(e) => setTierField(idx, "rtl_cost", Number(e.target.value))}
                            disabled={saving}
                          />
                        </td>

                        <td className="border-t border-gray-100 px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-32 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                            value={t.feeds_cost ?? 0}
                            onChange={(e) => setTierField(idx, "feeds_cost", Number(e.target.value))}
                            disabled={saving}
                          />
                        </td>

                        <td className="border-t border-gray-100 px-4 py-2 font-semibold">{money(t.total_cost)}</td>
                        <td className="border-t border-gray-100 px-4 py-2 font-semibold">{money(t.est_monthly_ui)}</td>

                        <td className="border-t border-gray-100 px-4 py-2 text-right">
                          <button
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                              isDeleted
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                            onClick={() => toggleDeleteTier(idx)}
                            disabled={saving}
                            title={isDeleted ? "Undo delete" : "Delete tier"}
                          >
                            <FiTrash2 />
                            {isDeleted ? "Undo" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Tier feed breakdown (unchanged) */}
          <div className="mt-4">
            <div className="text-sm font-extrabold text-gray-900">Tier feed breakdown</div>
            <div className="text-xs text-gray-600">Configure estimated feed kg per month per feed type for each tier.</div>

            <div className="mt-3 space-y-3">
              {draftTiers
                .filter((t) => !t.__deleted)
                .map((t) => {
                  const tierKey = String(t.tier_id || `new:${t.heads}:${t.months_to_pay}`);
                  const realTierId = t.tier_id;
                  const items = realTierId ? draftFeeds[String(realTierId)] || [] : [];

                  return (
                    <div key={tierKey} className="rounded-2xl border border-gray-200 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-bold text-gray-900">
                          Tier: {t.heads} heads • {t.months_to_pay} months
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => realTierId && addFeedRowForTier(realTierId)}
                          disabled={!realTierId || saving}
                          className={!realTierId ? "opacity-60" : ""}
                        >
                          <FiPlus className="mr-2" />
                          Add feed type
                        </Button>
                      </div>

                      {!realTierId ? (
                        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          This tier is new (no tier_id yet). Save first, then edit its feed breakdown.
                        </div>
                      ) : null}

                      {realTierId ? (
                        <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200">
                          <table className="min-w-full text-left text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-600">
                                <th className="px-4 py-3">Feed type</th>
                                <th className="px-4 py-3">Est kg / month</th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {!items.length ? (
                                <tr>
                                  <td className="px-4 py-4 text-gray-600" colSpan={3}>
                                    No feed types configured for this tier.
                                  </td>
                                </tr>
                              ) : (
                                items.map((it, idx) => (
                                  <tr key={`${realTierId}_${idx}`}>
                                    <td className="border-t border-gray-100 px-4 py-2">
                                      <select
                                        className="w-64 rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:border-yellow-400"
                                        value={String(it.feed_type_id ?? 0)}
                                        onChange={(e) =>
                                          updateFeedRow(realTierId, idx, { feed_type_id: Number(e.target.value) })
                                        }
                                        disabled={saving}
                                      >
                                        {feedTypes?.length ? (
                                          feedTypes.map((ft) => (
                                            <option key={ft.feed_type_id} value={String(ft.feed_type_id)}>
                                              {ft.name}
                                            </option>
                                          ))
                                        ) : (
                                          <option value={String(it.feed_type_id ?? 0)}>
                                            Feed type #{it.feed_type_id ?? 0}
                                          </option>
                                        )}
                                      </select>
                                    </td>

                                    <td className="border-t border-gray-100 px-4 py-2">
                                      <input
                                        type="number"
                                        step="0.1"
                                        className="w-40 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-yellow-400"
                                        value={it.est_feed_kg_month ?? 0}
                                        onChange={(e) =>
                                          updateFeedRow(realTierId, idx, { est_feed_kg_month: Number(e.target.value) })
                                        }
                                        disabled={saving}
                                      />
                                    </td>

                                    <td className="border-t border-gray-100 px-4 py-2 text-right">
                                      <button
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                                        onClick={() => removeFeedRow(realTierId, idx)}
                                        disabled={saving}
                                      >
                                        <FiTrash2 />
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
