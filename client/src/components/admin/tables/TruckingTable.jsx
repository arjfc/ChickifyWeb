import React, { useMemo, useState } from "react";

/**
 * Expected row shape (you can adjust to your actual API):
 * {
 *   tracking_profile_id: number;
 *   name: string;
 *   company_name: string;
 *   truck_number: string;
 *   phone_number?: string | null;
 *   plate_number: string;
 *   is_active: boolean;
 *   schedule?: string | Date | null;     // from tracking_allocation.schedule
 *   nextSchedule?: string | Date | null; // from tracking_profile
 * }
 */
export default function TruckingTable({
  rows = [],
  onAddDriver,
  onSelectionChange,
}) {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [searchName, setSearchName] = useState("");
  const [scheduleFrom, setScheduleFrom] = useState("");
  const [scheduleTo, setScheduleTo] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Unique company list for filter
  const companies = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.company_name) set.add(r.company_name);
    });
    return Array.from(set);
  }, [rows]);

  // Helpers
  const toDateOnly = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTime = (value) => {
    const d = toDateOnly(value);
    if (!d) return "—";
    return d.toLocaleString();
  };

  const formatScheduleDate = (value) => {
    const d = toDateOnly(value);
    if (!d) return "—";
    return d.toLocaleString();
  };

  // Filter logic
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Company filter
      if (companyFilter !== "all" && row.company_name !== companyFilter) {
        return false;
      }

      // Name search (case-insensitive)
      if (
        searchName.trim() &&
        !row.name.toLowerCase().includes(searchName.trim().toLowerCase())
      ) {
        return false;
      }

      // Schedule date range filter (if provided)
      if (scheduleFrom || scheduleTo) {
        // use schedule first, then fall back to nextSchedule
        const sched = toDateOnly(row.schedule ?? row.nextSchedule);
        if (!sched) return false;

        if (scheduleFrom) {
          const from = new Date(scheduleFrom);
          from.setHours(0, 0, 0, 0);
          if (sched < from) return false;
        }

        if (scheduleTo) {
          const to = new Date(scheduleTo);
          to.setHours(23, 59, 59, 999);
          if (sched > to) return false;
        }
      }

      return true;
    });
  }, [rows, companyFilter, searchName, scheduleFrom, scheduleTo]);

  // Selection logic
  const allVisibleIds = filteredRows.map((r) => r.tracking_profile_id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    let newSelected;
    if (isAllSelected) {
      // Remove all visible
      newSelected = selectedIds.filter((id) => !allVisibleIds.includes(id));
    } else {
      // Add all visible
      const set = new Set(selectedIds);
      allVisibleIds.forEach((id) => set.add(id));
      newSelected = Array.from(set);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(newSelected);
  };

  const toggleOne = (id) => {
    let newSelected;
    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((x) => x !== id);
    } else {
      newSelected = [...selectedIds, id];
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(newSelected);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-gray-900">
          List of Drivers
        </h2>

        <button
          type="button"
          onClick={onAddDriver}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition"
        >
          + Add driver
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Company filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Filter by company
          </label>
          <select
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm min-w-[180px]"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="all">All companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule filter (date range) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Schedule (date range)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              value={scheduleFrom}
              onChange={(e) => setScheduleFrom(e.target.value)}
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              value={scheduleTo}
              onChange={(e) => setScheduleTo(e.target.value)}
            />
          </div>
        </div>

        {/* Search by driver name */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600">
            Search by driver name
          </label>
          <input
            type="text"
            placeholder="Type driver name…"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[480px]">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2">
                {/* Uncomment if you want a "select all" checkbox */}
                {/* <input
                  type="checkbox"
                  className="h-4 w-4 accent-yellow-400"
                  checked={isAllSelected}
                  onChange={toggleAll}
                /> */}
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Schedule
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Next Schedule
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Driver Name
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Company
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Truck No.
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Phone Number
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Plate Number
              </th>
              <th className="px-3 py-2 font-semibold text-xs text-gray-700 uppercase tracking-wide text-center">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  No drivers found with the current filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const id = row.tracking_profile_id;
                const selected = selectedIds.includes(id);

                return (
                  <tr
                    key={id}
                    className={
                      "border-b border-gray-100 transition-colors " +
                      (selected ? "bg-yellow-50" : "hover:bg-[#FFF8D6]")
                    }
                  >
                    <td className="px-3 py-4 align-middle text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-yellow-400"
                        checked={selected}
                        onChange={() => toggleOne(id)}
                      />
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-700 text-center">
                      {formatScheduleDate(row.schedule)}
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-700 text-center">
                      {formatScheduleDate(row.nextSchedule)}
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-900 text-center">
                      {row.name}
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-700 text-center">
                      {row.company_name}
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-700 text-center">
                      {row.truck_number}
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-700 text-center">
                      {row.phone_number || "—"}
                    </td>

                    <td className="px-3 py-4 align-middle text-gray-700 text-center">
                      {row.plate_number}
                    </td>

                    <td className="px-3 py-4 align-middle text-center">
                      {row.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
