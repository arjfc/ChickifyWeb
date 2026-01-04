
import React, { useMemo, useState } from "react";
import EggFormationTab from "@/components/admin/poultry-guide/EggFormationTab";
import YolkColorTab from "@/components/admin/poultry-guide/YolkColorTab";
import EggShells from "@/components/admin/poultry-guide/EggShells";
import DirtyEggsTab from "@/components/admin/poultry-guide/DirtyEggsTab";
import EggHandlingTab from "@/components/admin/poultry-guide/EggHandlingTab";


const TABS = [
  "How eggs are formed",
  "Yolk Color",
  "Soft/Thin Egg Shells",
  "Dirty Eggs",
  "Egg Handling",
];

export default function Guide() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const content = useMemo(() => {
    if (activeTab === "How eggs are formed") return <EggFormationTab />;
    if (activeTab === "Yolk Color") return <YolkColorTab />;
    if (activeTab === "Soft/Thin Egg Shells") return <EggShells />;
    if (activeTab === "Dirty Eggs") return <DirtyEggsTab />;
    if (activeTab === "Egg Handling") return <EggHandlingTab />;

    return (
      <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
        <div className="text-lg font-semibold text-slate-800">{activeTab}</div>
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
          UI placeholder for: <span className="font-semibold">{activeTab}</span>
        </div>
      </div>
    );
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Tabs (raised tabs like your screenshot) */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={[
  "relative",
  "rounded-t-2xl px-6 py-4 text-sm font-semibold",
  "transition",
  active
    ? [
        // ✅ more noticeable active tab (yellow-ish)
        "bg-yellow-50 text-slate-900",
        "ring-1 ring-yellow-300",
        "shadow-[0_-1px_0_rgba(255,255,255,1),0_8px_20px_rgba(15,23,42,0.06)]",
      ].join(" ")
    : "bg-slate-100 text-slate-600 hover:bg-slate-200 ring-1 ring-slate-200",
  active ? "z-20 -mb-3" : "z-10",
].join(" ")}

                // className={[
                //   "relative",
                //   "rounded-t-2xl px-6 py-4 text-sm font-semibold",
                //   "transition",
                //   "ring-1 ring-slate-200",
                //   active
                //     ? "bg-white text-slate-900 shadow-[0_-1px_0_rgba(255,255,255,1),0_8px_20px_rgba(15,23,42,0.06)]"
                //     : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                //   // make active tab sit on top + connect to card
                //   active ? "z-20 -mb-3" : "z-10",
                // ].join(" ")}
              >
                {t}

                {/* This hides the card top border under the active tab so it looks “attached” */}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-[10px] h-[12px] bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Card (big white panel like screenshot) */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          {content}
        </div>
      </div>
    </div>
  );
}
