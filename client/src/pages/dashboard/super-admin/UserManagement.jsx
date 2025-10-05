import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
import { LuUsers } from "react-icons/lu";
import { GiFarmTractor } from "react-icons/gi";
import { FaUserLock } from "react-icons/fa";
import AdminVerTable from "../../../components/super-admin/tables/AdminVerTable";
import UserTable from "../../../components/UserTable";
import { DatePicker } from "@mui/x-date-pickers";
// import { listUsers /* suspendUsers */ } from "../../../api/user"; // still removed

const USER_TABS = ["All", "Admin", "Farmer", "Buyer"];
const ADMIN_VER_TABS = ["Pending", "Approved", "Rejected"];

export default function UserManagement() {
  const [selectedUserOption, setSelectedUserOption] = useState("Admin");
  const [selectedAdminOption, setSelectedAdminOption] = useState("Pending");
  const [dateFilter, setDateFilter] = useState(null);

  // selections coming from the table
  const [selectedIds, setSelectedIds] = useState([]);

  // data state (starts empty; no mock seeding)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);

  // KPI counts
  const { adminCount, farmerCount, buyerCount } = useMemo(() => {
    const byRoleActive = (r) =>
      users.filter(
        (u) => u.role?.toLowerCase() === r && u.status?.toLowerCase() === "active"
      ).length;
    return {
      adminCount: byRoleActive("admin"),
      farmerCount: byRoleActive("farmer"),
      buyerCount: byRoleActive("buyer"),
    };
  }, [users]);

  // rows for UserTable based on current tab + (optional) date filter
  const rowsForTable = useMemo(() => {
    return users.filter((u) => {
      const roleMatch =
        selectedUserOption === "All"
          ? true
          : u.role?.toLowerCase() === selectedUserOption.toLowerCase();

      // optional created_at day match
      let dateMatch = true;
      if (dateFilter && u.created_at) {
        const d = new Date(u.created_at);
        const a = new Date(dateFilter);
        dateMatch =
          d.getFullYear() === a.getFullYear() &&
          d.getMonth() === a.getMonth() &&
          d.getDate() === a.getDate();
      }
      return roleMatch && dateMatch;
    });
  }, [users, selectedUserOption, dateFilter]);

  // === Toolbar actions ===
  const [showAddModal, setShowAddModal] = useState(false);
  const handleAddUser = () => setShowAddModal(true);

  const handleSuspendSelected = async () => {
    alert(`Suspend ${selectedIds.length} user(s): ${selectedIds.join(", ")}`);
  };

  const handleSuspendAll = async () => {
    const allIds = rowsForTable.map((r) => r.id);
    if (allIds.length === 0) {
      alert("No users in the current view to suspend.");
      return;
    }
    alert(`Suspend ALL in view (${allIds.length}): ${allIds.join(", ")}`);
  };

  async function handleCreateUser(payload) {
    // still front-end only (optimistic add). plug backend later if needed.
    const normalized = {
      id: crypto.randomUUID(),
      firstName: payload.first_name,
      lastName: payload.last_name,
      email: payload.email,
      role: payload.role,
      status: "Active",
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [normalized, ...prev]);
    setShowAddModal(false);
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* KPI cards */}
      <DashboardCard
        title="Total Active Admin Users"
        icon={<FaUserLock className="text-6xl text-primaryYellow" />}
        data={adminCount}
      />
      <DashboardCard
        title="Total Active Farmer Users"
        icon={<GiFarmTractor className="text-6xl text-primaryYellow" />}
        data={farmerCount}
      />
      <DashboardCard
        title="Total Active Buyer Users"
        icon={<LuUsers className="text-6xl text-primaryYellow" />}
        data={buyerCount}
      />

      {/* Toolbar: role tabs + date filter + action button(s) */}
      <div className="col-span-3 flex items-center justify-between">
        <div className="flex gap-3">
          {USER_TABS.map((lbl) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setSelectedUserOption(lbl)}
              className={`px-4 py-2 rounded-xl border transition
                ${
                  selectedUserOption === lbl
                    ? "border-primaryYellow bg-yellow-50 text-primaryYellow"
                    : "border-gray-300 text-gray-600 hover:border-primaryYellow hover:text-primaryYellow"
                }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <DatePicker
            label="Filter by Date"
            value={dateFilter}
            onChange={(v) => setDateFilter(v)}
            slotProps={{ textField: { size: "small", sx: { width: 220 } } }}
          />

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSuspendSelected}
                className="bg-[#C3B17A] text-black font-medium rounded-lg px-5 py-2 hover:opacity-90"
              >
                Suspend ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={handleSuspendAll}
                className="bg-[#C3B17A] text-black font-medium rounded-lg px-5 py-2 hover:opacity-90"
              >
                Suspend All
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddUser}
              className="bg-black text-[#FEC619] font-medium rounded-lg px-5 py-2 hover:opacity-90"
            >
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        {loadingUsers ? (
          <p className="text-gray-500">Loading users…</p>
        ) : errorUsers ? (
          <p className="text-red-600">Error: {errorUsers}</p>
        ) : (
          <UserTable
            role="super-admin"
            rows={rowsForTable}
            onSelectionChange={setSelectedIds}
          />
        )}
      </div>

      {/* Admin Verification toolbar */}
      <div className="col-span-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-primaryYellow text-2xl mb-3">
            Admin Verification
          </h1>
          <div className="flex gap-3">
            {ADMIN_VER_TABS.map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setSelectedAdminOption(lbl)}
                className={`px-4 py-2 rounded-xl border transition
                  ${
                    selectedAdminOption === lbl
                      ? "border-primaryYellow bg-yellow-50 text-primaryYellow"
                      : "border-gray-300 text-gray-600 hover:border-primaryYellow hover:text-primaryYellow"
                  }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => alert("Approve clicked (wire up bulkVerify here)")}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => alert("Reject clicked (wire up bulkVerify here)")}
            className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Admin Verification table */}
      <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
        <AdminVerTable option={selectedAdminOption} />
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateUser}
          roles={["Admin", "Farmer", "Buyer"]}
        />
      )}
    </div>
  );
}

/* ── AddUserModal & helpers (unchanged UI; no required fields) ── */
function AddUserModal({ open, onClose, onSave, roles = [] }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    sex: "",
    phone: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({ ...form });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-[770px] max-w-[90vw] bg-white rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-3xl font-bold text-center text-primaryYellow mb-6">
          Add New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Last Name"
              placeholder="Enter Last Name"
              value={form.last_name}
              onChange={(v) => handleChange("last_name", v)}
            />
            <Field
              label="First Name"
              placeholder="Enter First Name"
              value={form.first_name}
              onChange={(v) => handleChange("first_name", v)}
            />
            <Field
              label="Middle Name"
              placeholder="Enter Middle Name"
              value={form.middle_name}
              onChange={(v) => handleChange("middle_name", v)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Sex</Label>
              <div className="flex gap-3">
                <RadioPill
                  label="Female"
                  checked={form.sex === "female"}
                  onChange={() => handleChange("sex", "female")}
                />
                <RadioPill
                  label="Male"
                  checked={form.sex === "male"}
                  onChange={() => handleChange("sex", "male")}
                />
              </div>
            </div>

            <Field
              label="Phone Number"
              placeholder="Enter Phone Number"
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
            />
            <Field
              label="Email"
              placeholder="Enter Email"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Role</Label>
              <div className="border rounded-xl px-4 py-3 border-gray-300 shadow-sm">
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-gray-300 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 rounded-xl bg-primaryYellow text-white font-semibold hover:opacity-90 transition"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-gray-700 font-semibold mb-2">{children}</label>;
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 shadow-sm outline-none focus:ring-2 border-gray-300 focus:ring-yellow-200"
      />
    </div>
  );
}

function RadioPill({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:border-primaryYellow transition"
      aria-pressed={checked}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400">
        <span className={`w-2 h-2 rounded-full ${checked ? "bg-primaryYellow" : "bg-transparent"}`} />
      </span>
      {label}
    </button>
  );
}






















// import React, { useState } from "react";
// import DashboardCard from "../../../components/DashboardCard";
// import { LuUsers } from "react-icons/lu";
// import { GiFarmTractor } from "react-icons/gi";
// import { FaUserLock } from "react-icons/fa";
// import AdminVerTable from "../../../components/super-admin/tables/AdminVerTable";
// import UserTable from "../../../components/UserTable";
// import { DatePicker } from "@mui/x-date-pickers";

// export default function UserManagement() {
//   const userOptions = ["Admin", "Farmer", "Buyer"];
//   const adminOptions = ["Pending", "Approved", "Rejected"];

//   const [selectedUserOption, setSelectedUserOption] = useState("Admin");
//   const [selectedAdminOption, setSelectedAdminOption] = useState("Pending");

//   const [value, onChange] = useState(new Date());

//   return (
//     <div className="grid grid-cols-3 gap-6 relative">
//       {/* Cards */}
//       <DashboardCard
//         title="Total Active Admin Users"
//         icon={<FaUserLock className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />
//       <DashboardCard
//         title="Total Active Farmer Users"
//         icon={<GiFarmTractor className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />
//       <DashboardCard
//         title="Total Active Buyer Users"
//         icon={<LuUsers className="text-6xl text-primaryYellow" />}
//         data={15300}
//       />

//       {/* Filter Tabs */}
//       <div className="col-span-3 flex flex-row justify-between items-center relative">
//         <div className="flex flex-row gap-5">
//           {userOptions.map((data) => (
//             <div
//               onClick={() => setSelectedUserOption(data)}
//               className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
//                 selectedUserOption === data
//                   ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                   : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//               }`}
//               key={data}
//             >
//               {data}
//             </div>
//           ))}
//         </div>

//         {/* Filter by Date Button */}
//         <DatePicker
//           label="Filter by Date"
//           onChange={(newValue) => onChange(newValue)}
//           slotProps={{
//             textField: {
//               size: "small",
//               sx: { width: 200 }, // 👈 set width here
//             },
//           }}
//         />
//       </div>

//       {/* User Table */}
//       <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <UserTable role="super-admin" option={selectedUserOption} />
//       </div>

//       {/* Admin Verification Section */}
//       <div className="col-span-3 flex flex-row justify-between items-center">
//         <div className="flex flex-col gap-5">
//           <h1 className="font-bold text-primaryYellow text-2xl">
//             Admin Verification
//           </h1>
//           <div className="flex flex-row gap-5">
//             {adminOptions.map((data) => (
//               <div
//                 onClick={() => setSelectedAdminOption(data)}
//                 className={`cursor-pointer rounded-xl px-5 py-2 transition-colors ${
//                   selectedAdminOption === data
//                     ? "border border-primaryYellow text-primaryYellow bg-yellow-50"
//                     : "border border-gray-300 text-gray-500 hover:border-primaryYellow hover:text-primaryYellow"
//                 }`}
//                 key={data}
//               >
//                 {data}
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="flex gap-5 h-full items-end">
//           <div
//             onClick={() => alert("clicked")}
//             className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//           >
//             <p className="text-lg">Approve</p>
//           </div>
//           <div
//             onClick={() => alert("clicked")}
//             className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//           >
//             <p className="text-lg">Reject</p>
//           </div>
//         </div>
//       </div>

//       {/* Admin Verification Table */}
//       <div className="col-span-3 p-6 rounded-lg border border-gray-200 shadow-lg">
//         <AdminVerTable option={selectedAdminOption} />
//       </div>
//     </div>
//   );
// }
