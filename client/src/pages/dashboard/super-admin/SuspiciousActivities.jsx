// src/pages/dashboard/super-admin/SuspiciousActivities.jsx
import { useMemo, useState } from "react";
import {
  LuChevronDown,
  LuFilter,
  LuCalendar,
  LuShapes,
  LuBadgeInfo,
} from "react-icons/lu";
import SuspiciousTable from "@/components/super-admin/tables/SuspiciousTable";

// ----- MOCK DATA (remove/replace later) -----
const MOCK_ROWS = [
  {
    id: 1,
    user: "Maria Lopez",
    type: "Multiple Complaints",
    details: "5 complaints filed in 3 days",
    risk: "High",
    dateFlagged: "2025-10-10",
    status: "Ongoing",
  },
  {
    id: 2,
    user: "Ana Santos",
    type: "Single Complaint",
    details: "1 complaints filed in 30 days",
    risk: "Low",
    dateFlagged: "2025-10-04",
    status: "Ongoing",
  },
  {
    id: 3,
    user: "Michael Cruz",
    type: "Payment Failures",
    details: "2 failed payments this week",
    risk: "Medium",
    dateFlagged: "2025-10-03",
    status: "Ongoing",
  },
  {
    id: 4,
    user: "Michael Cruz",
    type: "Payment Failures",
    details: "2 failed payments this week",
    risk: "Medium",
    dateFlagged: "2025-10-03",
    status: "Ongoing",
  },
  {
    id: 5,
    user: "Maria Lopez",
    type: "Multiple Complaints",
    details: "5 complaints filed in 3 days",
    risk: "High",
    dateFlagged: "2025-10-10",
    status: "Ongoing",
  },
  {
    id: 6,
    user: "John Reyes",
    type: "Single Complaint",
    details: "Customer dispute about refund",
    risk: "Low",
    dateFlagged: "2025-10-08",
    status: "Resolved",
  },
];

export default function SuspiciousActivities({
  rows = MOCK_ROWS, // 👈 default to mock rows
  loading = false,
}) {
  const [dateRange, setDateRange] = useState("all"); // "all" | "7" | "30"
  const [flagType, setFlagType] = useState("All");
  const [riskLvl, setRiskLvl] = useState("All");

  const filtered = useMemo(() => {
    const now = new Date();
    return rows.filter((r) => {
      if (dateRange !== "all" && r.dateFlagged) {
        const diffDays = (now - new Date(r.dateFlagged)) / 86400000;
        if (dateRange === "7" && diffDays > 7) return false;
        if (dateRange === "30" && diffDays > 30) return false;
      }
      if (flagType !== "All" && r.type !== flagType) return false;
      if (riskLvl !== "All" && r.risk !== riskLvl) return false;
      return true;
    });
  }, [rows, dateRange, flagType, riskLvl]);

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-7 flex flex-wrap items-center gap-3">
        <Select
          leftIcon={LuCalendar}
          value={dateRange}
          onChange={setDateRange}
          options={[
            { value: "all", label: "Date Range" },
            { value: "7", label: "Last 7 days" },
            { value: "30", label: "Last 30 days" },
          ]}
        />
        <Select
          leftIcon={LuShapes}
          value={flagType}
          onChange={setFlagType}
          options={[
            { value: "All", label: "Type of Flag" },
            { value: "Multiple Complaints", label: "Multiple Complaints" },
            { value: "Single Complaint", label: "Single Complaint" },
            { value: "Payment Failures", label: "Payment Failures" },
          ]}
        />
        <Select
          leftIcon={LuBadgeInfo}
          value={riskLvl}
          onChange={setRiskLvl}
          options={[
            { value: "All", label: "Risk Lvl" },
            { value: "High", label: "High" },
            { value: "Medium", label: "Medium" },
            { value: "Low", label: "Low" },
          ]}
        />

        {/* <button
          className="ml-auto inline-flex h-10 items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-600 shadow-sm"
          title="More filters"
        >
          <LuFilter className="text-gray-600" />
        </button> */}
      </div>

      <SuspiciousTable rows={filtered} loading={loading} />
    </div>
  );
}

/** Compact select with left icon + chevron, soft gray text */
function Select({ value, onChange, options, leftIcon: LeftIcon }) {
  return (
    <label className="relative">
      {LeftIcon && (
        <LeftIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
        "h-10 rounded-md",                     // ⬅️ Less border radius
        "border border-gray-300 bg-gray-100",  // ⬅️ Gray background
        "pl-10 pr-8",
        "text-sm text-gray-700",
        "shadow-sm focus:outline-none focus:ring-1 focus:ring-black-50",
        ].join(" ")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {/* <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" /> */}
    </label>
  );
}
