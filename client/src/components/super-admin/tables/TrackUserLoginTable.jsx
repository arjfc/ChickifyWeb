import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import dayjs from "dayjs";
import { fetchLastSignins } from "@/services/activityLogs";
import { fetchSuperadminProfile } from "@/services/Reports"; // 👈 NEW

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TrackUserTable = forwardRef(function TrackUserTable(
  { limit = 20, userrole = "All", fromDate = null, toDate = null, onCountChange },
  ref
) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to build pretty label for date range (raw props)
  const buildDateLabel = (from, to) => {
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Until ${to}`;
    return "All dates";
  };

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);

        const roleFilter =
          userrole && userrole !== "All" ? userrole : null;

        const start = fromDate
          ? dayjs(fromDate).startOf("day").toISOString()
          : null;
        const end = toDate
          ? dayjs(toDate).endOf("day").toISOString()
          : null;

        const data = await fetchLastSignins({
          limit,
          offset: 0,
          role: roleFilter,
          s_date: start,
          e_date: end,
        });

        if (!off) setRows(data ?? []);
      } catch (e) {
        console.error("Failed to fetch last sign-ins:", e);
      } finally {
        if (!off) setLoading(false);
      }
    })();

    return () => {
      off = true;
    };
  }, [limit, userrole, fromDate, toDate]);

  // Notify parent about count
  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(rows.length);
    }
  }, [rows.length, onCountChange]);

  const headers = [
    "LAST SIGN IN",
    "ROLE",
    "FULL NAME",
    "EMAIL",
    "CREATED ACCOUNT AT",
  ];

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })
      : "—";

  // ===== Unicode font (same pattern as 1st code) =====
  const FONT_NAME = "NotoSans";
  const FONT_FILE = "NotoSans-Regular.ttf";
  const FONT_URL = "/fonts/NotoSans-Regular.ttf";

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const ensureUnicodeFont = async (doc) => {
    try {
      const res = await fetch(FONT_URL);
      if (!res.ok) throw new Error(`Font fetch failed (${res.status})`);
      const buf = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(buf);

      doc.addFileToVFS(FONT_FILE, base64);
      doc.addFont(FONT_FILE, FONT_NAME, "normal");
      doc.addFont(FONT_FILE, FONT_NAME, "bold");
      doc.setFont(FONT_NAME, "normal");
      return true;
    } catch (e) {
      console.warn("[TrackUserTable] Unicode font not loaded:", e?.message || e);
      return false;
    }
  };

  // ===== Background & ICONS (copied pattern from 1st code) =====
  const BG_URL = "/background.png";
  const ADMIN_ICON_URL = "/icons/name.png";
  const ADDRESS_ICON_URL = "/icons/location.png";
  const PHONE_ICON_URL = "/icons/call.png";
  // const EMAIL_ICON_URL = "/icons/email.png";

  const loadBgImageAsDataUrl = async () => {
    try {
      const res = await fetch(BG_URL);
      if (!res.ok) throw new Error(`BG fetch failed (${res.status})`);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("[TrackUserTable] Failed to load PDF background:", e?.message || e);
      return null;
    }
  };

  const loadImageAsDataUrl = async (url) => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Image fetch failed (${res.status})`);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("[TrackUserTable] Failed to load icon:", url, e?.message || e);
      return null;
    }
  };

  // ===== Expose export API (same style as 1st code) =====
  useImperativeHandle(ref, () => ({
    async exportPdf(meta = {}) {
      const prettyFrom = fromDate
        ? dayjs(fromDate).isValid()
          ? dayjs(fromDate).format("MMMM D, YYYY")
          : fromDate
        : null;
      const prettyTo = toDate
        ? dayjs(toDate).isValid()
          ? dayjs(toDate).format("MMMM D, YYYY")
          : toDate
        : null;

      const {
        title = "Chickify Track Last Sign-ins",
        subtitle = userrole === "All" ? "All Roles" : userrole,
        filename = `user_signins_${userrole}_${
          fromDate || "all"
        }_${toDate || "all"}.pdf`,
      } = meta;

      // 🔹 Fetch Super Admin profile via RPC (same as 1st code)
      let superadminName = "—";
      let superadminAddress = "—";
      let superadminContact = "—";
      let superadminEmail = "—";

      try {
        const profile = await fetchSuperadminProfile();
        if (profile) {
          superadminName = profile.superadmin_full_name || "—";
          superadminAddress = profile.address || "—";
          superadminContact = profile.contact_no || "—";
          superadminEmail = profile.superadmin_email || "—";
        }
      } catch (e) {
        console.warn(
          "[TrackUserTable] Failed to load superadmin profile for PDF:",
          e
        );
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const hasUnicode = await ensureUnicodeFont(doc);

      // 🔹 Load background + icons
      const [
        bgDataUrl,
        adminIcon,
        addressIcon,
        phoneIcon,
        // emailIcon,
      ] = await Promise.all([
        loadBgImageAsDataUrl(),
        loadImageAsDataUrl(ADMIN_ICON_URL),
        loadImageAsDataUrl(ADDRESS_ICON_URL),
        loadImageAsDataUrl(PHONE_ICON_URL),
        // loadImageAsDataUrl(EMAIL_ICON_URL),
      ]);

      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width || pageSize.getWidth();
      const pageHeight = pageSize.height || pageSize.getHeight();
      const centerX = pageWidth / 2;

      // 🔹 Background
      if (bgDataUrl) {
        doc.addImage(bgDataUrl, "PNG", 0, 0, pageWidth, pageHeight);
      }

      const firstPageTop = 158;
      const otherPagesTop = 72;
      const marginBottom = 72;
      const marginX = 40;

      let cursorY = firstPageTop;

      const subtitleHeader = String(subtitle || "").toUpperCase();

      // Date range text (prettified)
      const dateLabel =
        prettyFrom || prettyTo
          ? `${prettyFrom || "—"} to ${prettyTo || "—"}`
          : "All dates";

      const rangeTxt = `Date range: ${dateLabel}`;

      // Generated on
      const generatedNow = dayjs();
      const generatedTxt = `Generated on: ${generatedNow.format(
        "MMMM D, YYYY h:mm A"
      )}`;

      // ===== HEADER =====
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(title, centerX, cursorY, { align: "center" });
      cursorY += 22;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(subtitleHeader, centerX, cursorY, { align: "center" });
      cursorY += 40;

      doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
      doc.setFontSize(11);
      doc.text(rangeTxt, pageWidth - marginX, cursorY, { align: "right" });
      cursorY += 14;

      doc.text(generatedTxt, pageWidth - marginX, cursorY, {
        align: "right",
      });
      cursorY += 16;

      // ===== TABLE BODY =====
      const body = (rows || []).map((r) => [
        fmt(r.last_sign_in_at || r.created_at),
        r.role_name ?? "—",
        r.actor_user || "(no name)",
        r.email || "—",
        fmt(r.created_at),
      ]);

      const bodySafe = body; // no special symbols here

      autoTable(doc, {
        startY: cursorY + 8,
        head: [headers],
        body: bodySafe,
        styles: {
          font: hasUnicode ? FONT_NAME : "helvetica",
          fontSize: 9,
          cellPadding: 6,
          minCellHeight: 18,
          halign: "center",
          textColor: [33, 33, 33],

        },
        headStyles: {
          font: "helvetica",
          fontSize: 9,
          fillColor: [255, 210, 77],
          textColor: [33, 33, 33],
        },
        margin: {
          top: otherPagesTop,
          bottom: marginBottom,
          left: marginX,
          right: marginX,
        },
        didDrawPage: () => {
          const pageSizeInner = doc.internal.pageSize;
          const pageWidthInner =
            pageSizeInner.width || pageSizeInner.getWidth();
          const pageHeightInner =
            pageSizeInner.height || pageSizeInner.getHeight();

          const footerTopY = pageHeightInner - marginBottom + 16;
          const pageLabelY = pageHeightInner - marginBottom / 2;

          const iconSize = 12;
          const iconTextGap = 6;
          const groupGap = 24;

          doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
          doc.setFontSize(9);

          const rowY = footerTopY;
          let x = marginX;

          const drawIconLabel = (icon, label) => {
            if (!label) return;
            if (icon) {
              doc.addImage(
                icon,
                "PNG",
                x,
                rowY - iconSize + 2,
                iconSize,
                iconSize
              );
            }
            const textX = x + (icon ? iconSize + iconTextGap : 0);
            doc.text(label, textX, rowY);
            const textWidth = doc.getTextWidth(label);
            const totalWidth =
              (icon ? iconSize + iconTextGap : 0) + textWidth + groupGap;
            x += totalWidth;
          };

          // 🔹 Superadmin info in one row (same pattern as 1st code)
          drawIconLabel(adminIcon, `${superadminName}`);
          drawIconLabel(
            addressIcon,
            superadminAddress ? `${superadminAddress}` : ""
          );
          drawIconLabel(
            phoneIcon,
            superadminContact ? `${superadminContact}` : ""
          );
          // drawIconLabel(
          //   emailIcon,
          //   superadminEmail ? `${superadminEmail}` : ""
          // );

          doc.text(
            `Page ${doc.getNumberOfPages()}`,
            pageWidthInner - marginX,
            pageLabelY,
            { align: "right" }
          );
        },
      });

      doc.save(filename);
    },
  }));

  if (loading) {
    return (
      <div className="text-center py-6">
        Loading user sign-ins…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* total records text */}
      <div className="text-xs text-gray-500">
        Total records displayed:{" "}
        <span className="font-semibold">{rows.length}</span>
      </div>

      <div className="max-h-[480px] overflow-auto rounded-md border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 text-yellow-500 border-b border-gray-300">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-5 text-center font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No users signed in with these filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.user_id}
                  className="text-gray-700 border-b border-gray-200"
                >
                  <td className="px-4 py-3 text-center font-medium">
                    {fmt(r.last_sign_in_at || r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.role_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.actor_user || "(no name)"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fmt(r.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TrackUserTable;






// import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
// import dayjs from "dayjs";
// import { fetchLastSignins } from "@/services/activityLogs";

// // PDF libs
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const TrackUserTable = forwardRef(function TrackUserTable(
//   { limit = 20, userrole = "All", date = "all" },
//   ref
// ) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   function computeRange(key) {
//     const startToday = dayjs().startOf("day");
//     switch (key) {
//       case "today":
//         return { start: startToday.toISOString(), end: startToday.add(1, "day").toISOString() };
//       case "yesterday":
//         return { start: startToday.subtract(1, "day").toISOString(), end: startToday.toISOString() };
//       case "7":
//         return { start: startToday.subtract(7, "day").toISOString(), end: null };
//       case "30":
//         return { start: startToday.subtract(30, "day").toISOString(), end: null };
//       case "this_month":
//         return {
//           start: dayjs().startOf("month").toISOString(),
//           end: dayjs().endOf("month").add(1, "millisecond").toISOString(),
//         };
//       case "last_month":
//         return {
//           start: dayjs().subtract(1, "month").startOf("month").toISOString(),
//           end: dayjs().subtract(1, "month").endOf("month").add(1, "millisecond").toISOString(),
//         };
//       case "all":
//       default:
//         if (typeof key === "string" && key.includes("T")) return { start: key, end: null };
//         return { start: null, end: null };
//     }
//   }

//   useEffect(() => {
//     let off = false;
//     (async () => {
//       try {
//         setLoading(true);
//         const { start, end } = computeRange(date);
//         const roleFilter = userrole && userrole !== "All" ? userrole : null;
//         const data = await fetchLastSignins({
//           limit,
//           offset: 0,
//           role: roleFilter,
//           s_date: start,
//           e_date: end,
//         });
//         if (!off) setRows(data ?? []);
//       } catch (e) {
//         console.error("Failed to fetch last sign-ins:", e);
//       } finally {
//         if (!off) setLoading(false);
//       }
//     })();
//     return () => {
//       off = true;
//     };
//   }, [limit, userrole, date]);

//   const headers = ["LAST SIGN IN", "ROLE", "FULL NAME", "EMAIL", "CREATED ACCOUNT AT"];
//   const fmt = (iso) =>
//     iso
//       ? new Date(iso).toLocaleString("en-US", {
//           month: "long",
//           day: "numeric",
//           year: "numeric",
//           hour: "numeric",
//           minute: "numeric",
//           hour12: true,
//         })
//       : "—";

//   // ===== Unicode font (optional, consistent) =====
//   const FONT_NAME = "NotoSans";
//   const FONT_FILE = "NotoSans-Regular.ttf";
//   const FONT_URL = "/fonts/NotoSans-Regular.ttf";

//   const arrayBufferToBase64 = (buffer) => {
//     let binary = "";
//     const bytes = new Uint8Array(buffer);
//     for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
//     return btoa(binary);
//   };

//   const ensureUnicodeFont = async (doc) => {
//     try {
//       const res = await fetch(FONT_URL);
//       if (!res.ok) throw new Error(`Font fetch failed (${res.status})`);
//       const buf = await res.arrayBuffer();
//       const base64 = arrayBufferToBase64(buf);
//       doc.addFileToVFS(FONT_FILE, base64);
//       doc.addFont(FONT_FILE, FONT_NAME, "normal");
//       doc.setFont(FONT_NAME, "normal");
//       return true;
//     } catch (e) {
//       console.warn("[TrackUserTable] Unicode font not loaded:", e?.message || e);
//       return false;
//     }
//   };

//   // ===== Expose export API =====
//   useImperativeHandle(ref, () => ({
//     async exportPdf(meta = {}) {
//       const {
//         title = "Chickify Track Last Sign-ins",
//         subtitle = `${userrole} • ${date}`,
//         filename = `user_signins_${userrole}_${date}.pdf`,
//       } = meta;

//       const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
//       const hasUnicode = await ensureUnicodeFont(doc);

//       const marginX = 40;
//       let cursorY = 40;

//       // Title
//       doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "bold");
//       doc.setFontSize(18);
//       doc.text(title, marginX, cursorY);
//       cursorY += 22;

//       // Subtitle
//       doc.setFont(hasUnicode ? FONT_NAME : "helvetica", "normal");
//       doc.setFontSize(12);
//       doc.text(subtitle, marginX, cursorY);
//       cursorY += 12;

//       const body = (rows || []).map((r) => [
//         fmt(r.last_sign_in_at || r.created_at),
//         r.role_name ?? "—",
//         r.actor_user || "(no name)",
//         r.email || "—",
//         fmt(r.created_at),
//       ]);

//       autoTable(doc, {
//         startY: cursorY + 8,
//         head: [headers],
//         body,
//         styles: { font: hasUnicode ? FONT_NAME : "helvetica", fontSize: 9, cellPadding: 4, halign: "center" },
//         headStyles: { fillColor: [255, 210, 77], textColor: [33, 33, 33] },
//         didDrawPage: () => {
//           const pageSize = doc.internal.pageSize;
//           const pageHeight = pageSize.height || pageSize.getHeight();
//           doc.setFontSize(10);
//           doc.text(`Page ${doc.getNumberOfPages()}`, marginX, pageHeight - 20);
//         },
//       });

//       doc.save(filename);
//     },
//   }));

//   if (loading) return <div className="text-center py-6">Loading user sign-ins…</div>;

//   return (
//     <div className="max-h:[480px] overflow-auto rounded-md border border-gray-200">
//       <table className="min-w-full text-sm">
//         <thead className="sticky top-0 z-10">
//           <tr className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 text-yellow-500 border-b border-gray-300">
//             {headers.map((h, i) => (
//               <th key={i} className="px-6 py-5 text-center font-semibold">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.length === 0 ? (
//             <tr>
//               <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-500">
//                 No users signed in with these filters.
//               </td>
//             </tr>
//           ) : (
//             rows.map((r) => (
//               <tr key={r.user_id} className="text-gray-700 border-b border-gray-200">
//                 <td className="px-4 py-3 text-center font-medium">
//                   {fmt(r.last_sign_in_at || r.created_at)}
//                 </td>
//                 <td className="px-4 py-3 text-center">{r.role_name ?? "—"}</td>
//                 <td className="px-4 py-3 text-center">{r.actor_user || "(no name)"}</td>
//                 <td className="px-4 py-3 text-center">{r.email || "—"}</td>
//                 <td className="px-4 py-3 text-center">{fmt(r.created_at)}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// });

// export default TrackUserTable;
