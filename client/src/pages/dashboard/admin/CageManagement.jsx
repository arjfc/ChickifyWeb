import React, { useMemo, useState } from "react";
import HowToCleanCageTab from "@/components/admin/poultry-guide/HowToCleanCageTab";
import WhatTimeToCleanTab from "@/components/admin/poultry-guide/WhatTimeToCleanTab";
import CageSpaceRequirementsTab from "@/components/admin/poultry-guide/CageSpaceRequirementsTab";
import FeederSpaceRequirementsTab from "@/components/admin/poultry-guide/FeederSpaceRequirementsTab";
import WatererSpaceRequirementsTab from "@/components/admin/poultry-guide/WatererSpaceRequirementsTab";


const TABS = [
  "How to clean the cage",
  "What time to clean",
  "Cage Space Requirements",
  "Feeder Space Requirements",
  "Waterer Space Requirements",
];

export default function Guide() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const content = useMemo(() => {
    if (activeTab === "How to clean the cage") return <HowToCleanCageTab />;
    if (activeTab === "What time to clean") return <WhatTimeToCleanTab />;
    if (activeTab === "Cage Space Requirements") return <CageSpaceRequirementsTab />;
    if (activeTab === "Feeder Space Requirements") return <FeederSpaceRequirementsTab />;
    if (activeTab === "Waterer Space Requirements") return <WatererSpaceRequirementsTab />;

    return null;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto w-full max-w-7xl">
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
                        "bg-yellow-50 text-slate-900",
                        "ring-1 ring-yellow-300",
                        "shadow-[0_-1px_0_rgba(255,255,255,1),0_8px_20px_rgba(15,23,42,0.06)]",
                      ].join(" ")
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 ring-1 ring-slate-200",
                  active ? "z-20 -mb-3" : "z-10",
                ].join(" ")}
              >
                {t}
                {active && <span className="absolute left-0 right-0 -bottom-[10px] h-[12px] bg-white" />}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          {content}
        </div>
      </div>
    </div>
  );
}
