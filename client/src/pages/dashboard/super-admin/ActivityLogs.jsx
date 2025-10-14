import { useState, useEffect } from "react";
import LogsTable from "@/components/super-admin/tables/LogsTable";
import TrackUserTable from "@/components/super-admin/tables/TrackUserLoginTable";
import { BsGrid } from "react-icons/bs";
import { fetchAllActionType } from "@/services/activityLogs";
import { LuCalendar } from "react-icons/lu";

export default function ActivityLogs() {
  // ===== Activity Logs (tabs) =====
  const adminOptions = ["Admin", "Farmer", "Buyer"];
  const [selectedAdminOption, setSelectedAdminOption] = useState("Admin");

  // ===== Activity logs filters =====
  const [dateRange, setDateRange] = useState("all"); 
  const [types, setTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");

  // ===== Track Last Sign-ins filters =====
  const [loginRole, setLoginRole] = useState("All");          
  const [loginDateRange, setLoginDateRange] = useState("all"); 

  const dateOptions = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "last_month", label: "Last month" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const actionTypes = await fetchAllActionType();
        setTypes(["All", ...actionTypes]);
      } catch (err) {
        console.error("Failed to load action types:", err);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* =================== Activity Logs =================== */}
      <div className="flex items-center bg-primaryYellow p-2 rounded-xl">
        <div className="flex gap-2">
          {adminOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedAdminOption(opt)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedAdminOption === opt
                  ? "border border-primaryYellow text-black bg-yellow-50"
                  : "text-black hover:bg-yellow-100/40"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 [&_svg]:w-4 [&_svg]:h-4">
        <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
          <LuCalendar className="text-gray-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
          <BsGrid className="text-gray-600" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700"
          >
            {types.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LogsTable
        selectedOption={selectedAdminOption}
        type={selectedType}
        dateRange={dateRange}
      />

      {/* =================== Track last sign-ins =================== */}
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-xl font-semibold text-grey-800">TRACK LAST SIGN-INS</h2>

        <div className="flex items-center gap-3 [&_svg]:w-4 [&_svg]:h-4">
          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
            <LuCalendar className="text-gray-600" />
            <select
              value={loginDateRange}
              onChange={(e) => setLoginDateRange(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border border-gray-300 shadow-sm rounded-md px-2 py-1">
            <BsGrid className="text-gray-600" />
            <select
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            >
              {["All", "admin", "farmer", "buyer"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <TrackUserTable
        limit={15}
        userrole={loginRole}   
        date={loginDateRange}  
      />
    </div>
  );
}
