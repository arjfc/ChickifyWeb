// pages/admin/PriceForecastAnalysis.jsx
import React, { useMemo, useState, useEffect } from "react";
import PriceForecastChart from "@/components/Charts/Admin/PriceForecastChart";
import { getCebuSeasonalPricesLocal } from "@/services/analytics";

export default function PriceForecastAnalysis() {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const yr = new Date().getFullYear();
    const f = getCebuSeasonalPricesLocal(yr, 300);
    setForecast(f || []);
  }, []);

  // Normalize forecast into a monthly array with month labels
  const monthly = useMemo(() => {
    if (!forecast || !forecast.length) return [];

    return forecast.map((d) => {
      const dt = new Date(d.month_date);
      const monthLabel = dt.toLocaleString("en", { month: "short" }); 
      return {
        ...d,
        monthLabel,
      };
    });
  }, [forecast]);

  // Helper to get stats over any segment (by index range)
  const getSegmentStats = (startIdx, endIdx) => {
    const slice = monthly.slice(startIdx, endIdx + 1);
    if (!slice.length) return null;

    const prices = slice.map((m) => m.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    return {
      maxPrice,
      minPrice,
    };
  };

  // Whole-year stats
  const stats = useMemo(() => {
    if (!monthly.length) {
      return {
        maxPrice: 0,
        maxMonth: "—",
        minPrice: 0,
        minMonth: "—",
        change: 0,
        changePct: 0,
        trend: "No data",
      };
    }

    const prices = monthly.map((m) => m.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    const maxMonth = monthly.find((m) => m.price === maxPrice)?.monthLabel ?? "—";
    const minMonth = monthly.find((m) => m.price === minPrice)?.monthLabel ?? "—";

    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    const changePct = first ? (change / first) * 100 : 0;

    const trend =
      changePct > 5
        ? "Strong upward trend"
        : changePct > 0
        ? "Mild upward trend"
        : changePct < -5
        ? "Strong downward trend"
        : "Stable";

    return {
      maxPrice,
      maxMonth,
      minPrice,
      minMonth,
      change,
      changePct,
      trend,
    };
  }, [monthly]);

  // Segment-based stats for narrative (Jan–Apr, May–Jul, Aug–Dec)
  const segJanApr = useMemo(() => getSegmentStats(0, 3), [monthly]);  // 0–3
  const segMayJul = useMemo(() => getSegmentStats(4, 6), [monthly]);  // 4–6
  const segAugDec = useMemo(() => getSegmentStats(7, 11), [monthly]); // 7–11

  const formatPrice = (val) =>
    typeof val === "number" && !Number.isNaN(val) ? `₱${val.toFixed(0)}` : "—";

  // Convert demand_tag → label + explanation
  const conditionLabelFromTag = (tag) => {
    switch (tag) {
      case "in-demand":
        return "In-demand";
      case "not-in-demand":
        return "Not-in-demand";
      case "balanced":
      default:
        return "Balanced";
    }
  };

  const shortExplanationFromTag = (tag) => {
    switch (tag) {
      case "in-demand":
        return "High demand from buyers; prices tend to be elevated.";
      case "not-in-demand":
        return "Weaker demand or oversupply; prices tend to soften.";
      case "balanced":
      default:
        return "Normal balance between supply and demand.";
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[2.1fr,1fr]">
        <div className="space-y-6">

          {/* Forecast chart */}
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
            <div className="h-72 w-full md:h-80">
              <PriceForecastChart data={forecast} showViewMore={false} />
            </div>
          </section>

          {/* Trend narrative */}
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Interpretation of Trend
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Jan–Apr */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-700 md:text-sm">
                <p className="font-semibold text-slate-900">
                  Jan – Apr: Price Decline
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  <li>Post-holiday slowdown in demand.</li>
                  <li>Higher supply from normal production can cause oversupply.</li>
                  <li>
                    Prices soften from around{" "}
                    <span className="font-semibold">
                      {formatPrice(segJanApr?.maxPrice)}
                    </span>{" "}
                    down to{" "}
                    <span className="font-semibold">
                      {formatPrice(segJanApr?.minPrice)}
                    </span>
                    .
                  </li>
                </ul>
              </div>

              {/* May–Jul */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-700 md:text-sm">
                <p className="font-semibold text-slate-900">
                  May – Jul: Recovery Phase
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  <li>Demand starts increasing (fiestas, school season).</li>
                  <li>Heat stress can slightly reduce production on some farms.</li>
                  <li>
                    Prices recover in the range of{" "}
                    <span className="font-semibold">
                      {formatPrice(segMayJul?.minPrice)}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {formatPrice(segMayJul?.maxPrice)}
                    </span>
                    .
                  </li>
                </ul>
              </div>

              {/* Aug–Dec */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-700 md:text-sm">
                <p className="font-semibold text-slate-900">
                  Aug – Dec: High-Demand Season
                </p>
                <ul className="mt-2 space-y-1 list-disc pl-5">
                  <li>“Ber months” drive stronger order volume.</li>
                  <li>Households, bakeries, and food businesses increase usage.</li>
                  <li>
                    Prices climb and peak between{" "}
                    <span className="font-semibold">
                      {formatPrice(segAugDec?.minPrice)}
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold">
                      {formatPrice(segAugDec?.maxPrice)}
                    </span>
                    .
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Monthly breakdown table */}
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Monthly Breakdown
              </h2>
              <p className="text-xs text-slate-500 md:text-sm">
                Forecasted price per tray and market condition based on the
                seasonal model.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-600 md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-3 py-2 font-medium text-slate-500">
                      Month
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-500">
                      Forecast Price (₱/tray)
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-500">
                      Market Condition
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-500">
                      Short Explanation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m, idx) => {
                    const conditionLabel = conditionLabelFromTag(m.demand_tag);
                    const explanation = shortExplanationFromTag(m.demand_tag);

                    return (
                      <tr
                        key={m.month_date || idx}
                        className={`border-b border-slate-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {m.monthLabel}
                        </td>
                        <td className="px-3 py-2">
                          {formatPrice(m.price)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              m.demand_tag === "in-demand"
                                ? "bg-emerald-50 text-emerald-700"
                                : m.demand_tag === "not-in-demand"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {conditionLabel}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[11px] md:text-xs">
                          {explanation}
                        </td>
                      </tr>
                    );
                  })}

                  {!monthly.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-center text-xs text-slate-500"
                      >
                        No forecast data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Stats + Factors + Recommendations */}
        <div className="space-y-6">
          {/* Stats cards */}
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 md:text-base">
              Forecast Highlights
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Highest Price</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatPrice(stats.maxPrice)}
                </p>
                <p className="text-xs text-slate-500">
                  Expected in{" "}
                  <span className="font-medium">{stats.maxMonth}</span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Lowest Price</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatPrice(stats.minPrice)}
                </p>
                <p className="text-xs text-slate-500">
                  Expected in{" "}
                  <span className="font-medium">{stats.minMonth}</span>
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Year Change</p>
                <p className="mt-1 text-lg font-semibold text-emerald-600">
                  {stats.change >= 0 ? "+" : "-"}
                  {formatPrice(Math.abs(stats.change))}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.changePct >= 0 ? "+" : "-"}
                  {Math.abs(stats.changePct).toFixed(1)}% vs first month
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Overall Trend</p>
                <p className="mt-1 text-xs font-semibold text-slate-900 md:text-sm">
                  {stats.trend}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Based on the full-year seasonal price pattern.
                </p>
              </div>
            </div>
          </section>

          {/* Factors */}
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 md:text-base">
              Key Factors Affecting Price
            </h2>
            <ul className="space-y-3 text-xs text-slate-700 md:text-sm">
              <li>
                <span className="font-semibold text-slate-900">
                  Demand volume:
                </span>{" "}
                Higher buyer orders increase price; low activity pushes it down.
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Supply levels:
                </span>{" "}
                Oversupply in early months lowers prices; reduced production in
                hotter months pushes them up.
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Seasonality:
                </span>{" "}
                Ber-months and school opening increase egg consumption.
              </li>
              <li>
                <span className="font-semibold text-slate-900">
                  Heat stress & farm conditions:
                </span>{" "}
                Fewer eggs produced during extreme heat, especially mid-year.
              </li>
            </ul>
          </section>

          {/* Recommendations */}
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 md:text-base">
              Strategic Recommendations
            </h2>

            <div className="space-y-3 text-xs text-slate-700 md:text-sm">
              <div>
                <p className="font-semibold text-slate-900">For Farmers</p>
                <ul className="mt-1 space-y-1 list-disc pl-5">
                  <li>
                    Increase production and allocation for{" "}
                    <span className="font-medium">high-price months</span>{" "}
                    (typically where the model tags periods as{" "}
                    <span className="italic">in-demand</span>).
                  </li>
                  <li>
                    Use early months with{" "}
                    <span className="font-medium">lower prices</span> to manage
                    costs and plan feed and flock investment.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">For Coops/Admins</p>
                <ul className="mt-1 space-y-1 list-disc pl-5">
                  <li>
                    Adjust pricing strategy ahead of forecasted increases to
                    keep margins stable and transparent for buyers.
                  </li>
                  <li>
                    Coordinate allocation planning to avoid stockouts in
                    projected in-demand months.
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">For Buyers</p>
                <ul className="mt-1 space-y-1 list-disc pl-5">
                  <li>
                    Consider bulk purchasing during{" "}
                    <span className="font-medium">balanced / lower-price</span>{" "}
                    periods to reduce cost.
                  </li>
                  <li>
                    Expect higher prices in{" "}
                    <span className="font-medium">in-demand</span> months and
                    adjust budgets accordingly.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Methodology */}
          <section className="rounded-2xl bg-slate-900 p-4 text-xs text-slate-100 shadow-sm md:p-5 md:text-sm">
            <p className="font-semibold text-white">
              How this forecast is generated
            </p>
            <p className="mt-2 text-slate-200/90">
              The system uses last year&apos;s order prices and volumes per
              month, then applies a seasonal model (via
              <span className="font-semibold">
                {" "}
                getCebuSeasonalPricesLocal()
              </span>
              ) to estimate the expected price per tray for the current year.
              Each month is tagged as in-demand, balanced, or not-in-demand
              based on simulated supply–demand conditions, and these tags drive
              both the color-coding of the chart and the monthly analysis shown
              on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
