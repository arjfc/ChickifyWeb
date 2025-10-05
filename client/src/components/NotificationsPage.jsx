import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LuTruck, LuShoppingBag, LuMessageSquare, LuCalendar } from "react-icons/lu";

function categorize(n) {
  if (n.category) return n.category;
  if (n.icon === "truck" || n.icon === "bag") return "orders";
  if (n.icon === "message") return "message";
  return "other";
}

export default function NotificationsPage() {
  const {
    notifs,
    markAllAsRead,
    markOneAsRead,
    markOneAsUnread,
    removeOne,
  } = useOutletContext();

  const unreadCount = notifs.filter((n) => !n.read).length;

  const [tab, setTab] = useState("All");   // "All" | "Message" | "Orders"
  const [dateRange, setDateRange] = useState("all"); // "all" | "7" | "30"

  // Date menu open/close
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef(null);
  useEffect(() => {
    const onClickAway = (e) => {
      if (!dateRef.current) return;
      if (!dateRef.current.contains(e.target)) setDateOpen(false);
    };
    document.addEventListener("click", onClickAway);
    return () => document.removeEventListener("click", onClickAway);
  }, []);

  const filtered = useMemo(() => {
    let base = notifs;
    if (tab === "Orders") base = base.filter((n) => categorize(n) === "orders");
    if (tab === "Message") base = base.filter((n) => categorize(n) === "message");
    // dateRange filter placeholder (apply when you add created_at)
    return base;
  }, [notifs, tab, dateRange]);

  return (
    <div className="w-full">
      {/* Top bar: tabs + date range */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {["All", "Message", "Orders"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "px-4 py-2 rounded-xl border text-sm font-semibold transition",
                tab === t
                  ? "bg-yellow-50 border-primaryYellow text-primaryYellow shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Date range button + popover */}
        <div ref={dateRef} className="relative">
          <button
            onClick={() => setDateOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
            title="Date Range"
          >
            <LuCalendar className="w-4 h-4" />
            <span>
              {dateRange === "all"
                ? "Date Range"
                : dateRange === "7"
                ? "Last 7 days"
                : "Last 30 days"}
            </span>
            <span className="ml-1">▾</span>
          </button>

          {dateOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-10">
              {[
                { k: "all", label: "All time" },
                { k: "7", label: "Last 7 days" },
                { k: "30", label: "Last 30 days" },
              ].map((opt) => (
                <button
                  key={opt.k}
                  onClick={() => {
                    setDateRange(opt.k);
                    setDateOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    dateRange === opt.k ? "text-primaryYellow font-medium" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main card — full width */}
      <div className="w-full rounded-2xl bg-white border border-gray-300 shadow-sm overflow-hidden">
        {/* Header with divider underneath */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-sm border-b border-gray-300">
          <p className="text-gray-500">
            You have <span className="font-semibold text-gray-700">{unreadCount}</span> unread
            notifications
          </p>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`font-semibold ${
              unreadCount === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-primaryYellow hover:underline"
            }`}
          >
            Mark all as read
          </button>
        </div>

        {/* List */}
        <ul className="divide-y divide-gray-300">
          {filtered.length === 0 && (
            <li className="p-10 text-center text-gray-500">No notifications.</li>
          )}

          {filtered.map((n) => {
            const category = categorize(n);
            const isUnread = !n.read;

            let Icon = LuShoppingBag;
            if (n.icon === "truck") Icon = LuTruck;
            if (n.icon === "bag") Icon = LuShoppingBag;
            if (n.icon === "message") Icon = LuMessageSquare;

            return (
              <li key={n.id} className="px-4 sm:px-6 py-4">
                <div className="flex items-start gap-4">
                  {/* left yellow dot */}
                  <span
                    className={`mt-2 h-2.5 w-2.5 rounded-full ${
                      isUnread ? "bg-primaryYellow" : "bg-gray-300"
                    }`}
                  />

                  {/* icon */}
                  <div className="grid place-items-center w-12 h-12 rounded-xl bg-yellow-50 shrink-0">
                    <Icon className="w-7 h-7 text-primaryYellow" />
                  </div>

                  {/* text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => (isUnread ? markOneAsRead(n.id) : markOneAsUnread(n.id))}
                        className={`text-left truncate ${
                          isUnread
                            ? "text-primaryYellow font-semibold"
                            : "text-gray-800 font-medium"
                        }`}
                        title={n.title}
                      >
                        {n.title}
                      </button>
                      <p className="text-gray-400 text-xs shrink-0">{n.time}</p>
                    </div>

                    <p className="mt-1 text-sm text-gray-600 leading-snug">{n.body}</p>

                    <div className="mt-3 flex items-center gap-2">
                      {isUnread ? (
                        <button
                          onClick={() => markOneAsRead(n.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Mark as read
                        </button>
                      ) : (
                        <button
                          onClick={() => markOneAsUnread(n.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Mark as unread
                        </button>
                      )}
                      <button
                        onClick={() => removeOne(n.id)}
                        className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>

                      <span className="ml-auto text-[11px] rounded-full px-2 py-0.5 bg-gray-100 text-gray-600">
                        {category === "orders"
                          ? "Orders"
                          : category === "message"
                          ? "Message"
                          : "General"}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
