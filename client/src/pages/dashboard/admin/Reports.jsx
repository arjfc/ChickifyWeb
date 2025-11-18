import ReportTable from "../../../components/admin/tables/ReportTable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

/* ======================== helpers (same as first code) ======================== */
const pad = (n) => String(n).padStart(2, "0");
const toYMD = (d) =>
  d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";

const parseYMD = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return isNaN(dt) ? null : dt;
};

const isSameDay = (a, b) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const inRange = (d, a, b) => (a && b ? d >= a && d <= b : false);

function addMonths(d, n) {
  const copy = new Date(d.getFullYear(), d.getMonth(), 1);
  copy.setMonth(copy.getMonth() + n);
  return copy;
}

function daysInMonth(year, monthIdx) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

/* ======================== Calendar Grid (same as first code) ======================== */
function MonthGrid({ monthDate, start, end, hovering, onPick }) {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const firstDay = new Date(y, m, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const total = daysInMonth(y, m);

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));

  return (
    <div className="w-[320px]">
      <div className="grid grid-cols-7 text-[12px] text-gray-400 mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
          <div key={w} className="py-1 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const isStart = d && start && isSameDay(d, start);
          const isEnd = d && end && isSameDay(d, end);
          const isMiddle =
            d &&
            start &&
            (end || hovering) &&
            inRange(
              d,
              start < (end || hovering) ? start : end || hovering,
              start < (end || hovering) ? end || hovering : start
            );

          const active = isStart || isEnd || isMiddle;

          return (
            <button
              key={i}
              disabled={!d}
              onClick={() => d && onPick(d)}
              className={[
                "h-10 rounded-md text-sm transition-colors",
                !d && "cursor-default",
                d && "hover:bg-gray-700/30",
                active && "bg-primaryYellow/20",
                (isStart || isEnd) &&
                  "bg-primaryYellow text-black hover:bg-primaryYellow",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {d ? d.getDate() : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ======================== Popover (same as first code) ======================== */
function DateRangePopover({ open, onClose, value, onChange }) {
  // value = { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
  const initial = parseYMD(value.from) || new Date();
  const [cursor, setCursor] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1)
  );
  const [start, setStart] = useState(parseYMD(value.from));
  const [end, setEnd] = useState(parseYMD(value.to));
  const [hovering, setHovering] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setStart(parseYMD(value.from));
    setEnd(parseYMD(value.to));
    const base = parseYMD(value.from) || new Date();
    setCursor(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [open]); // eslint-disable-line

  const onPick = (d) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else if (!end) {
      if (d < start) {
        setEnd(start);
        setStart(d);
      } else {
        setEnd(d);
      }
    }
  };

  const display = (d) =>
    d
      ? d.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-24">
      <div className="bg-black/40 absolute inset-0" />
      <div
        ref={ref}
        className="relative z-[81] w-[720px] rounded-xl border border-gray-700 bg-[#1b1c1f] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/70 text-sm">
              <LuCalendar className="w-4 h-4" />
              <span>Date range</span>
            </div>
            <div className="text-xs text-gray-400">
              {display(start)} — {display(end)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-gray-700/60"
              onClick={() => setCursor(addMonths(cursor, -1))}
              aria-label="Prev"
            >
              <LuChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-md hover:bg-gray-700/60"
              onClick={() => setCursor(addMonths(cursor, 1))}
              aria-label="Next"
            >
              <LuChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendars */}
        <div
          className="flex gap-6 p-4"
          onMouseLeave={() => setHovering(null)}
        >
          {/* Left (cursor month) */}
          <div className="flex flex-col gap-2">
            <div className="text-center text-sm text-gray-300">
              {cursor.toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </div>
            <MonthGrid
              monthDate={cursor}
              start={start}
              end={end}
              hovering={hovering}
              onPick={onPick}
            />
          </div>

          {/* Right (next month) */}
          <div className="flex flex-col gap-2">
            <div className="text-center text-sm text-gray-300">
              {addMonths(cursor, 1).toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </div>
            <MonthGrid
              monthDate={addMonths(cursor, 1)}
              start={start}
              end={end}
              hovering={hovering}
              onPick={onPick}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <button
            className="px-3 py-2 text-sm rounded-md hover:bg-gray-700/60"
            onClick={() => {
              setStart(null);
              setEnd(null);
            }}
          >
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm rounded-md bg-primaryYellow text-black hover:opacity-90"
              onClick={() => {
                onChange?.({
                  from: toYMD(start),
                  to: toYMD(end),
                });
                onClose?.();
              }}
              disabled={!start || !end}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================== Page (updated second code) ======================== */
export default function Reports() {
  const options = [
    "Payout History",
    "Sales Records",
    "Transaction Records",
    "Egg Stock",
    "Egg Production",
    "List of Farmers",
  ];

  const [selectedOption, setSelectedOption] = useState("Payout History");

  // Backend-facing YYYY-MM-DD (unchanged)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // UI state for popover
  const [open, setOpen] = useState(false);

  // ref to call export from child
  const tableRef = useRef(null);

  const handleGenerate = async () => {
    try {
      await tableRef.current?.exportPdf({
        title: "Chickify Reports",
        subtitle: selectedOption,
        dateFrom,
        dateTo,
      });
    } catch (e) {
      console.error("PDF export failed:", e);
      alert("Failed to generate PDF.");
    }
  };

  // Button label for current range
  const rangeLabel = useMemo(() => {
    const f = parseYMD(dateFrom);
    const t = parseYMD(dateTo);
    if (!f || !t) return "Date range";
    const opts = { month: "short", day: "numeric", year: "numeric" };
    return `${f.toLocaleDateString(undefined, opts)} – ${t.toLocaleDateString(
      undefined,
      opts
    )}`;
  }, [dateFrom, dateTo]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex flex-row items-center gap-6 border-b border-gray-200">
          {options.map((data) => (
            <div
              key={data}
              onClick={() => setSelectedOption(data)}
              className={`text-base font-semibold cursor-pointer transition-colors duration-200 pb-1 ${
                selectedOption === data
                  ? "text-primaryYellow border-b-2 border-primaryYellow"
                  : "text-gray-400"
              }`}
            >
              {data}
            </div>
          ))}
        </div>

        {/* Date range trigger + Generate */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-md border border-gray-600 bg-[#1b1c1f] text-sm text-white hover:bg-gray-800"
            >
              <LuCalendar className="w-4 h-4" />
              <span>{rangeLabel}</span>
            </button>

            {(dateFrom || dateTo) && (
              <button
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleGenerate}
            className="bg-primaryYellow text-white text-sm font-semibold rounded-md px-3 py-1 h-9"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-5 rounded-lg border border-gray-200 shadow-lg">
        <ReportTable
          ref={tableRef}
          selectedOption={selectedOption}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      </div>

      {/* Popover */}
      <DateRangePopover
        open={open}
        onClose={() => setOpen(false)}
        value={{ from: dateFrom, to: dateTo }}
        onChange={({ from, to }) => {
          setDateFrom(from || "");
          setDateTo(to || "");
        }}
      />
    </div>
  );
}
