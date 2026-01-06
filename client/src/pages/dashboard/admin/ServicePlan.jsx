// src/pages/dashboard/admin/CoopServicePlanPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import EditCoopServicePlanModal from "@/components/admin/modals/EditServicePlanModal";
import CoopServiceAvailmentsTable from "@/components/admin/tables/CoopServiceAvailmentsTable"; // ✅ ADD THIS
import {
  fetchMyServicePlans,
  fetchTiersByPlanIds,
  fetchTierFeedsByTierIds,
  fetchFeedTypes,
} from "@/services/coopServicePlan";

function monthsLabel(m) {
  const n = Number(m || 0);
  if (!n) return "—";
  if (n === 12) return "1 year";
  if (n === 18) return "1.5 years";
  if (n === 24) return "2 years";
  if (n % 12 === 0) return `${n / 12} years`;
  return `${n} months`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString();
}

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

/* ---------------------------------- Page ---------------------------------- */

export default function CoopServicePlanPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [plans, setPlans] = useState([]);
  const [tiersByPlan, setTiersByPlan] = useState({});
  const [tierFeedsByTier, setTierFeedsByTier] = useState({});
  const [feedTypes, setFeedTypes] = useState([]);

  const [activePlanId, setActivePlanId] = useState(null);

  const [editOpen, setEditOpen] = useState(false);

  const feedTypeName = useMemo(() => {
    const m = new Map();
    for (const ft of feedTypes) m.set(Number(ft.feed_type_id), ft.name);
    return m;
  }, [feedTypes]);

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const [p, ft] = await Promise.all([fetchMyServicePlans(), fetchFeedTypes()]);
      setPlans(p);
      setFeedTypes(ft || []);

      const planIds = (p || []).map((x) => x.plan_id);
      const tiers = await fetchTiersByPlanIds(planIds);

      // group tiers by plan
      const grouped = {};
      for (const t of tiers) {
        const pid = Number(t.plan_id);
        grouped[pid] = grouped[pid] || [];
        grouped[pid].push(t);
      }
      setTiersByPlan(grouped);

      // tier feeds
      const tierIds = tiers.map((t) => t.tier_id);
      const feeds = await fetchTierFeedsByTierIds(tierIds);

      const feedsMap = {};
      for (const f of feeds) {
        const tid = Number(f.tier_id);
        feedsMap[tid] = feedsMap[tid] || [];
        feedsMap[tid].push(f);
      }
      setTierFeedsByTier(feedsMap);

      // set default active plan
      const defaultPlan = p.find((x) => x.is_recommended) || p[0] || null;
      setActivePlanId((prev) => prev ?? (defaultPlan ? defaultPlan.plan_id : null));
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activePlan = useMemo(() => {
    return plans.find((p) => Number(p.plan_id) === Number(activePlanId)) || null;
  }, [plans, activePlanId]);

  const activeTiers = useMemo(() => {
    if (!activePlanId) return [];
    return tiersByPlan?.[Number(activePlanId)] || [];
  }, [tiersByPlan, activePlanId]);

  const planCards = useMemo(() => {
    return (plans || []).map((p) => {
      const tiers = tiersByPlan?.[Number(p.plan_id)] || [];
      const heads = Array.from(new Set(tiers.map((t) => t.heads))).sort((a, b) => a - b);
      const months = Array.from(new Set(tiers.map((t) => t.months_to_pay))).sort((a, b) => a - b);

      const totalCosts = tiers.map((t) =>
        Number(t.total_cost || (Number(t.rtl_cost || 0) + Number(t.feeds_cost || 0)))
      );
      const minCost = totalCosts.length ? Math.min(...totalCosts) : 0;
      const maxCost = totalCosts.length ? Math.max(...totalCosts) : 0;

      return {
        plan: p,
        isActive: Number(p.plan_id) === Number(activePlanId),
        heads,
        months,
        minCost,
        maxCost,
      };
    });
  }, [plans, tiersByPlan, activePlanId]);

  const planTone = (p) => {
    if (!p.is_active) return "danger";
    if (p.is_recommended) return "warn";
    return "neutral";
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Coop Service Plans</h2>
          <p className="text-sm text-gray-600">
            Fetches from <span className="font-semibold">admin_coop_service_plan</span>, tiers, and tier
            feed breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setEditOpen(true)} disabled={loading || !plans.length}>
            Coop edit
          </Button>
        </div>
      </div>

      {err ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {/* Plans (cards) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-600">Loading service plans…</div>
        ) : !plans.length ? (
          <div className="py-10 text-center text-sm text-gray-600">No service plans found for this admin.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {planCards.map((c) => {
              const p = c.plan;
              const selected = c.isActive;

              return (
                <button
                  key={p.plan_id}
                  onClick={() => setActivePlanId(p.plan_id)}
                  className={`text-left rounded-2xl border p-4 shadow-sm transition ${
                    selected
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-base font-extrabold text-gray-900">{p.title || p.service_type}</div>
                    <Badge tone={planTone(p)}>
                      {p.is_recommended ? "Recommended" : p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">{p.description || "—"}</div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-gray-800">Heads:</div>
                      <div className="text-right text-gray-700">{c.heads.length ? c.heads.join(", ") : "—"}</div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-gray-800">Terms:</div>
                      <div className="text-right text-gray-700">
                        {c.months.length ? c.months.map(monthsLabel).join(", ") : "—"}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-gray-800">Total cost:</div>
                      <div className="text-right text-gray-700">
                        {c.maxCost > 0 ? `₱${money(c.minCost)} – ₱${money(c.maxCost)}` : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Updated: <span className="font-semibold text-gray-700">{fmtDate(p.updated_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tiers for selected plan */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-900">
              Tier Plans {activePlan ? `— ${activePlan.title || activePlan.service_type}` : ""}
            </div>
            <div className="text-sm text-gray-600">
              From <span className="font-semibold">admin_coop_service_plan_tier</span> and{" "}
              <span className="font-semibold">admin_coop_service_plan_tier_feed</span>.
            </div>
          </div>
        </div>

        {!activePlanId ? (
          <div className="py-10 text-center text-sm text-gray-600">Select a plan to view tiers.</div>
        ) : !activeTiers.length ? (
          <div className="py-10 text-center text-sm text-gray-600">No tiers found for this plan.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Heads</Th>
                <Th>Months to pay</Th>
                <Th>Est feed kg/mo</Th>
                <Th>Est sacks/mo</Th>
                <Th>RTL cost</Th>
                <Th>Feeds cost</Th>
                <Th>Total cost</Th>
                <Th>Est monthly</Th>
                <Th>Feed breakdown</Th>
              </tr>
            </thead>
            <tbody>
              {activeTiers.map((t) => {
                const total =
                  Number(t.total_cost || 0) || (Number(t.rtl_cost || 0) + Number(t.feeds_cost || 0));
                const monthly =
                  Number(t.est_monthly || 0) ||
                  (Number(t.months_to_pay || 0) > 0 ? total / Number(t.months_to_pay || 1) : 0);

                const feeds = tierFeedsByTier?.[t.tier_id] || [];
                const breakdown = feeds.length
                  ? feeds
                      .map((x) => {
                        const name = feedTypeName.get(Number(x.feed_type_id)) || `#${x.feed_type_id}`;
                        return `${name}: ${Number(x.est_feed_kg_month || 0)}kg`;
                      })
                      .join(" • ")
                  : "—";

                return (
                  <tr key={t.tier_id}>
                    <Td>{t.heads}</Td>
                    <Td>{monthsLabel(t.months_to_pay)}</Td>
                    <Td>{Number(t.est_feed_kg_month || 0)}</Td>
                    <Td>{Number(t.est_sacks_month || 0)}</Td>
                    <Td>₱{money(t.rtl_cost)}</Td>
                    <Td>₱{money(t.feeds_cost)}</Td>
                    <Td className="font-semibold">₱{money(total)}</Td>
                    <Td className="font-semibold">₱{money(monthly)}</Td>
                    <Td className="max-w-[520px]">
                      <span className="block truncate">{breakdown}</span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>

      {/* ✅ NEW: Service availments table (RPC-driven) */}
      <CoopServiceAvailmentsTable />

      {/* Coop edit modal */}
      <EditCoopServicePlanModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        plans={plans}
        tiersByPlan={tiersByPlan}
        tierFeedsByTier={tierFeedsByTier}
        feedTypes={feedTypes}
        onSaved={load}
      />
    </div>
  );
}
