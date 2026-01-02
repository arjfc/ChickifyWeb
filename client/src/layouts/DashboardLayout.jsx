// DashboardLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { IoMdOptions } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
import { LuBell, LuShoppingBag, LuTruck } from "react-icons/lu";
import { IoCashOutline } from "react-icons/io5"; // 💰 payout/remit icon
import { useAuth } from "../context/AuthContext";

// ✅ RPC client usage
import {
  fetchRefundNotificationsAdmin,
  fetchPayoutRequestsAdmin,
} from "@/services/Notifications";
import { fetchAllRemittances } from "@/services/Remittance";

// ✅ Facebook-style "time ago" formatter with minutes, hours, days
function timeAgo(ts, nowMs) {
  if (!ts) return "—";
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return "—";

  const now = typeof nowMs === "number" ? nowMs : Date.now();
  let diffMs = now - t;

  if (diffMs < 0) diffMs = 0; // just in case clock is weird

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec} sec${diffSec === 1 ? "" : "s"} ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  }

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) {
    return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  // older than a week → show date
  const d = new Date(t);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date(now).getFullYear() ? "numeric" : undefined,
  });
}

// ✅ helpers for localStorage read-state
const getReadKey = (userId) => `refund_notifs_read_${userId}`;

const getReadSet = (userId) => {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(getReadKey(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const saveReadSet = (userId, set) => {
  if (!userId) return;
  localStorage.setItem(getReadKey(userId), JSON.stringify(Array.from(set)));
};

export default function DashboardLayout() {
  const { user, getRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ---- sidebar
  const [isOpen, setIsOpen] = useState(false);

  // ---- role
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await getRole();
        if (on) setRole(r);
      } finally {
        if (on) setRoleLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [getRole]);

  const roleLabel =
    role === "superadmin"
      ? "Super Admin"
      : role === "admin"
      ? "Admin"
      : "";

  // ---- notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]); // { id, title, body, time, icon, read, raw }
  const unread = notifs.filter((n) => !n.read).length;
  const notifRef = useRef(null);

  // 👇 badge visibility + known IDs
  const [showBadge, setShowBadge] = useState(true);
  const knownNotifIdsRef = useRef(new Set());

  // 👇 "current time" tick for live-updating timestamps
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 60_000); // every 60 seconds

    return () => clearInterval(timer);
  }, []);

  const markAllAsRead = () => {
    if (!user?.id) return;
    setNotifs((list) => {
      const updated = list.map((n) => ({ ...n, read: true }));
      const readSet = new Set(updated.filter((n) => n.read).map((n) => n.id));
      saveReadSet(user.id, readSet);
      return updated;
    });
  };

  const markOneAsRead = (id) => {
    if (!user?.id) return;
    setNotifs((list) => {
      const updated = list.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const readSet = new Set(updated.filter((n) => n.read).map((n) => n.id));
      saveReadSet(user.id, readSet);
      return updated;
    });
  };

  const markOneAsUnread = (id) => {
    if (!user?.id) return;
    setNotifs((list) => {
      const updated = list.map((n) =>
        n.id === id ? { ...n, read: false } : n
      );
      const readSet = new Set(updated.filter((n) => n.read).map((n) => n.id));
      saveReadSet(user.id, readSet);
      return updated;
    });
  };

  const removeOne = (id) =>
    setNotifs((list) => list.filter((n) => n.id !== id));

  // close dropdown when clicking outside
  useEffect(() => {
    const onClickAway = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("click", onClickAway);
    return () => document.removeEventListener("click", onClickAway);
  }, []);

  // ✅ Load notifications based on ROLE
  useEffect(() => {
    if (roleLoading) return;
    if (!user?.id) return;

    let isMounted = true;

    async function loadNotifs() {
      try {
        // ---------- ADMIN NOTIFS (refund + payout + reminder) ----------
        if (role === "admin") {
          const [refundRows, payoutRows] = await Promise.all([
            fetchRefundNotificationsAdmin(),
            fetchPayoutRequestsAdmin(),
          ]);

          if (!isMounted) return;

          const readSet = getReadSet(user.id);

          setNotifs((prev) => {
            const prevById = new Map(prev.map((n) => [n.id, n]));

            // ---- Refund notifications
            const refundNotifs = (refundRows || []).map((row) => {
              const id = `refund-${row.refund_id}`;
              const existing = prevById.get(id);
              const alreadyRead =
                (existing && existing.read) || readSet.has(id);

              return {
                id,
                title: "Refund Request",
                body:
                  row.reason ||
                  existing?.body ||
                  "A buyer submitted a refund request.",
                // still storing time, but UI will recompute live
                time: timeAgo(row.created_at),
                icon: "refund", // icon type
                read: !!alreadyRead,
                raw: { ...row, type: "refund" },
              };
            });

            // ---- Payout notifications
            const payoutNotifs = (payoutRows || []).map((row) => {
              const id = `payout-${row.payout_id}`;
              const existing = prevById.get(id);
              const alreadyRead =
                (existing && existing.read) || readSet.has(id);

              return {
                id,
                title: "Payout Request",
                body:
                  existing?.body ||
                  `A farmer requested a payout of ₱${Number(
                    row.amount || 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}.`,
                time: timeAgo(row.requested_at || row.created_at),
                icon: "payout",
                read: !!alreadyRead,
                raw: { ...row, type: "payout" },
              };
            });

            // ---- System notification: last week of the month reminder (ADMIN)
            const systemNotifs = [];
            const now = new Date();
            const year = now.getFullYear();
            const monthIndex = now.getMonth(); // 0-11
            const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
            const today = now.getDate();
            const inLastWeek = today >= lastDayOfMonth - 6; // last 7 days of month

            if (inLastWeek) {
              const sysId = `system-remit-${year}-${monthIndex + 1}`;
              const existing = prevById.get(sysId);
              const alreadyRead =
                (existing && existing.read) || readSet.has(sysId);

              systemNotifs.push({
                id: sysId,
                title: "Monthly Remittance Reminder",
                body:
                  "Reminder: Please remit this month's collected fees to the Super Admin before the month ends.",
                time: "This week",
                icon: "system",
                read: !!alreadyRead,
                raw: {
                  type: "system-remit",
                  created_at: now.toISOString(),
                },
              });
            }

            const all = [...refundNotifs, ...payoutNotifs, ...systemNotifs];

            // sort newest first
            all.sort((a, b) => {
              const ta =
                new Date(
                  a.raw.created_at || a.raw.requested_at || 0
                ).getTime() || 0;
              const tb =
                new Date(
                  b.raw.created_at || b.raw.requested_at || 0
                ).getTime() || 0;
              return tb - ta;
            });

            return all;
          });
        }
        // ---------- SUPERADMIN NOTIFS (remittance only) ----------
        else if (role === "superadmin") {
          let remitRows = [];
          try {
            remitRows = (await fetchAllRemittances()) || [];
          } catch (remitErr) {
            console.warn(
              "fetchAllRemittances failed (superadmin notifs):",
              remitErr
            );
            remitRows = [];
          }

          if (!isMounted) return;

          const readSet = getReadSet(user.id);

          setNotifs((prev) => {
            const prevById = new Map(prev.map((n) => [n.id, n]));

            const remitNotifs = (remitRows || []).map((row) => {
              const key =
                row.remit_id ||
                row.remittance_id ||
                row.ledger_id ||
                row.id;

              const id = `remit-${key}`;
              const existing = prevById.get(id);
              const alreadyRead =
                (existing && existing.read) || readSet.has(id);

              const amt = Number(row.amount || 0);
              const coopName =
                row.coop_name ||
                row.admin_name ||
                row.coop ||
                "A coop/admin";

              return {
                id,
                title: "New Remittance Received",
                body:
                  existing?.body ||
                  `${coopName} submitted a remittance of ₱${amt.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}.`,
                time: timeAgo(
                  row.created_at ||
                    row.remitted_at ||
                    row.paid_at ||
                    row.updated_at
                ),
                icon: "remit",
                read: !!alreadyRead,
                raw: { ...row, type: "remit" },
              };
            });

            // sort newest first
            remitNotifs.sort((a, b) => {
              const ta =
                new Date(
                  a.raw.created_at ||
                    a.raw.remitted_at ||
                    a.raw.paid_at ||
                    0
                ).getTime() || 0;
              const tb =
                new Date(
                  b.raw.created_at ||
                    b.raw.remitted_at ||
                    b.raw.paid_at ||
                    0
                ).getTime() || 0;
              return tb - ta;
            });

            return remitNotifs;
          });
        } else {
          // Other roles: no web notifications here
          if (isMounted) setNotifs([]);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }

    // initial fetch
    loadNotifs();

    // optional polling every 30s so new requests appear
    const interval = setInterval(loadNotifs, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role, roleLoading, user]);

  // 👇 show badge again when new notif IDs appear
  useEffect(() => {
    if (!notifs || notifs.length === 0) return;

    const currentIds = new Set(notifs.map((n) => n.id));
    let hasNew = false;

    currentIds.forEach((id) => {
      if (!knownNotifIdsRef.current.has(id)) {
        knownNotifIdsRef.current.add(id);
        hasNew = true;
      }
    });

    if (hasNew) {
      setShowBadge(true);
    }
  }, [notifs]);

  // ✅ when bell is clicked: open dropdown & hide badge (but DO NOT mark as read)
  const handleBellClick = () => {
    setNotifOpen((prev) => {
      const next = !prev;
      if (next) {
        // just hide the number badge when dropdown opens
        setShowBadge(false);
      }
      return next;
    });
  };

  // ✅ when clicking a notification item: mark that one as read and go to proper page
  const handleClickNotification = (id) => {
    markOneAsRead(id);
    setNotifOpen(false);

    const clicked = notifs.find((n) => n.id === id);

    if (role === "admin") {
      if (clicked?.raw?.type === "payout") {
        navigate("/admin/payout-request");
      } else if (clicked?.raw?.type === "refund") {
        navigate("/admin/complaints");
      } else {
        navigate("/admin/notifications");
      }
    } else if (role === "superadmin") {
      if (
        clicked?.raw?.type === "remit" ||
        clicked?.raw?.type === "system-remit"
      ) {
        navigate("/super-admin/remittance");
      } else {
        navigate("/super-admin/notifications");
      }
    } else {
      navigate("/admin/notifications");
    }
  };

  const pageTitles = {
    // superadmin
    "/super-admin": "Dashboard",
    "/super-admin/users": "User Management",
    "/super-admin/suspicious-activities": "Suspicious Activities",
    "/super-admin/product-management": "Product Management",
    "/super-admin/orders": "Orders",
    "/super-admin/pricing": "Pricing Management",
    "/super-admin/remittance": "Remittance",
    "/super-admin/activity-logs": "Activity Logs",
    "/super-admin/reports": "Reports",
    "/super-admin/settings": "Account Settings",
    "/super-admin/users/view-users": "Admin's Profile",
    "/super-admin/users/edit-users": "Edit Admin's Profile",
    "/super-admin/notifications": "Notifications",

    // admin
    "/admin/notifications": "Notifications",
    "/admin": "Dashboard",
    "/admin/users": "User Management",
    "/admin/users/view-users": "Farmer's Profile",
    "/admin/users/edit-users": "Edit Farmer's Profile",
    "/admin/products/egg-inventory": "Egg Inventory",
    "/admin/products/details": "Product Details",
    "/admin/products/discount-management": "Discount Management",
    "/admin/products/price-management": "Price Management",
    "/admin/expenses/business": "Business",
    "/admin/expenses/expense": "Expense",
    "/admin/expenses/feed-monitoring": "Feed Monitoring",
    "/admin/expenses/feed-entry": "Feed Entry",
    "/admin/order-status": "Order Status",
    "/admin/messages": "Messages",
    "/admin/complaints": "Refunds",
    "/admin/payout-request": "Payout Request",
    "/admin/reports": "Reports",
    "/admin/settings": "Account Settings",
    "/admin/price-forecast-analysis": "Price Forecast Analysis",
    "/admin/reviews": "Reviews",
    "/admin/service-plan": "Service Plan",

  };

  const excludedPaths = [
    "/super-admin/settings",
    "/super-admin/users/view-users",
    "/super-admin/users/edit-users",
    "/super-admin/reports/some-subpage",
    "/admin/settings",
    "/admin/users/view-users",
    "/admin/users/edit-users",
  ];

  const hideHeader = excludedPaths.includes(location.pathname);
  const currentTitle = pageTitles[location.pathname] || "Page";

  const displayName =
    user?.user_metadata?.firstName && user?.user_metadata?.lastName
      ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
      : user?.email || "Account";

  return (
    <div className="flex font-poppins" id="dashboard">
      {/* ✅ functional sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* shift content based on sidebar state */}
      <div
        className={`w-full px-20 py-10 transition-all duration-300 ease-in-out ${
          isOpen ? "ml-60" : "ml-20"
        }`}
      >
        {!hideHeader ? (
          <header className="flex flex-row mb-6 pb-3 w-full gap-4 items-center">
            <h1 className="text-4xl font-bold capitalize text-primaryYellow shrink-0">
              {currentTitle}
            </h1>

            {/* Search */}
            <div className="relative flex-grow">
              <HiMagnifyingGlass className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-gray-200 rounded-full bg-gray-50 pl-12 pr-12 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryYellow focus:border-primaryYellow transition"
              />
              <IoMdOptions className="absolute inset-y-0 right-4 my-auto w-5 h-5 text-gray-500 cursor-pointer hover:text-primaryYellow transition" />
            </div>

            {/* Bell + Profile */}
            <div className="flex items-center gap-3">
              {/* Bell */}
              <div ref={notifRef} className="relative">
                <button
                  aria-label="Notifications"
                  onClick={handleBellClick}
                  className={`relative grid place-items-center w-11 h-11 rounded-xl transition
                    ${
                      unread > 0
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  <LuBell
                    className={`w-6 h-6 ${
                      unread > 0 ? "text-red-500" : "text-gray-700"
                    }`}
                  />
                  {unread > 0 && showBadge && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] min-h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white ring-2 ring-white"
                      title={`${unread} unread`}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {/* dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-[520px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="flex items-start justify-between px-6 pt-5 pb-3">
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          Notifications
                        </p>
                        <p className="text-sm text-gray-500">
                          {notifs.length === 0
                            ? "You're all caught up."
                            : `You have ${unread} unread notification${
                                unread === 1 ? "" : "s"
                              }`}
                        </p>
                      </div>
                      <button
                        onClick={markAllAsRead}
                        disabled={unread === 0}
                        className={`font-semibold text-sm hover:underline ${
                          unread === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-primaryYellow"
                        }`}
                      >
                        Mark all as read
                      </button>
                    </div>

                    <ul className="max-h-[360px] overflow-auto divide-y divide-gray-100">
                      {notifs.map((n) => {
                        const isUnread = !n.read;

                        // 👇 compute base timestamp for this notif
                        const baseTs =
                          n.raw?.created_at ||
                          n.raw?.requested_at ||
                          n.raw?.remitted_at ||
                          n.raw?.paid_at ||
                          n.raw?.updated_at;

                        return (
                          <li
                            key={n.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleClickNotification(n.id)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handleClickNotification(n.id)
                            }
                            className="flex gap-4 px-6 py-4 bg-white cursor-pointer hover:bg-gray-50 focus:outline-none"
                            aria-label={`${n.title} - ${
                              isUnread ? "unread" : "read"
                            }`}
                          >
                            {/* left dot */}
                            <span
                              className={`mt-2 h-2.5 w-2.5 rounded-full ${
                                isUnread ? "bg-primaryYellow" : "bg-gray-300"
                              }`}
                            />
                            {/* icon */}
                            <div
                              className={`grid place-items-center w-11 h-11 rounded-xl ${
                                isUnread ? "bg-yellow-50" : "bg-gray-100"
                              }`}
                            >
                              {n.icon === "refund" ? (
                                <LuShoppingBag
                                  className={`w-6 h-6 ${
                                    isUnread
                                      ? "text-primaryYellow"
                                      : "text-gray-400"
                                  }`}
                                />
                              ) : n.icon === "payout" ? (
                                <IoCashOutline
                                  className={`w-6 h-6 ${
                                    isUnread
                                      ? "text-primaryYellow"
                                      : "text-gray-400"
                                  }`}
                                />
                              ) : n.icon === "remit" ? (
                                <IoCashOutline
                                  className={`w-6 h-6 ${
                                    isUnread
                                      ? "text-primaryYellow"
                                      : "text-gray-400"
                                  }`}
                                />
                              ) : n.icon === "system" ? (
                                <LuBell
                                  className={`w-6 h-6 ${
                                    isUnread
                                      ? "text-primaryYellow"
                                      : "text-gray-400"
                                  }`}
                                />
                              ) : n.icon === "truck" ? (
                                <LuTruck
                                  className={`w-6 h-6 ${
                                    isUnread
                                      ? "text-primaryYellow"
                                      : "text-gray-400"
                                  }`}
                                />
                              ) : (
                                <LuShoppingBag
                                  className={`w-6 h-6 ${
                                    isUnread
                                      ? "text-primaryYellow"
                                      : "text-gray-400"
                                  }`}
                                />
                              )}
                            </div>
                            {/* text */}
                            <div className="flex-1">
                              <p
                                className={`${
                                  isUnread
                                    ? "text-primaryYellow font-semibold"
                                    : "text-gray-800 font-medium"
                                }`}
                              >
                                {n.title}
                              </p>
                              <p
                                className={`text-sm leading-snug ${
                                  isUnread
                                    ? "text-gray-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {n.body}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {baseTs ? timeAgo(baseTs, nowTick) : "—"}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      className="w-full text-center py-3 text-gray-700 font-medium hover:bg-gray-50"
                      onClick={() => {
                        setNotifOpen(false);
                        const base =
                          role === "superadmin" ? "/super-admin" : "/admin";
                        navigate(`${base}/notifications`);
                      }}
                    >
                      View all Notifications
                    </button>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center gap-4 cursor-pointer rounded-xl px-3 py-2 hover:bg-gray-100 transition">
                <div className="flex flex-col leading-tight">
                  <h1 className="font-semibold text-gray-800">
                    {displayName}
                  </h1>
                  {!roleLoading && roleLabel && (
                    <p className="text-sm text-gray-500 capitalize">
                      {roleLabel}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
                  <MdAccountCircle className="w-10 h-10 text-gray-600" />
                </div>
              </div>
            </div>
          </header>
        ) : (
          // compact header (kept as-is, but time now also updates using nowTick)
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex flex-col leading-tight">
                <p className="text-primaryYellow text-3xl font-bold">
                  {currentTitle}
                </p>
                {(() => {
                  const viewed = location.state?.user;
                  const onProfileView =
                    location.pathname.includes("view-users");
                  const onProfileEdit =
                    location.pathname.includes("edit-users");

                  const lastTs =
                    viewed?.last_seen ||
                    viewed?.lastSignInAt ||
                    viewed?.last_sign_in_at ||
                    viewed?.updated_at;

                  const subline = onProfileView
                    ? `Last online: ${timeAgo(lastTs, nowTick)}`
                    : onProfileEdit
                    ? `Last online: ${timeAgo(lastTs, nowTick)}`
                    : location.pathname.includes("super-admin")
                    ? "Super Admin"
                    : "Admin";

                  return (
                    <p className="text-lg text-gray-500 font-normal">
                      {subline}
                    </p>
                  );
                })()}
              </div>
            </div>
            <div className="flex flex-col leading-tight items-end">
              {location.pathname.includes("edit-users") ? (
                <button className="cursor-pointer text-base rounded-lg text-white font-bold shadow-md bg-primaryYellow px-4 py-3">
                  {location.pathname.includes("super-admin")
                    ? "Remove Admin Access"
                    : "Suspend"}
                </button>
              ) : (
                <>
                  <p className="text-gray-500 text-lg font-semibold">
                    Registration Date
                  </p>
                  <p className="text-gray-500">Aug. 20, 2026</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <Outlet
          context={{
            notifs,
            setNotifs,
            markAllAsRead,
            markOneAsRead,
            markOneAsUnread,
            removeOne,
          }}
        />
      </div>
    </div>
  );
}
