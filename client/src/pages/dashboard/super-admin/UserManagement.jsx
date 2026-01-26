// src/pages/super-admin/user-management/index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
import { LuUsers } from "react-icons/lu";
import { GiFarmTractor } from "react-icons/gi";
import { FaUserLock } from "react-icons/fa";
import AdminVerTable from "../../../components/super-admin/tables/AdminVerTable";
import UserTable from "../../../components/UserTable";
import { DatePicker } from "@mui/x-date-pickers";

import {
  fetchUserTotals,
  fetchUsers,
  createUserWithPassword,
  suspendUser,
} from "@/services/superAdminUsers";

const USER_TABS = ["All", "Admin", "Farmer", "Buyer"];
const ADMIN_VER_TABS = ["Pending", "Approved", "Rejected"];

export default function UserManagement() {
  const [selectedUserOption, setSelectedUserOption] = useState("Admin");
  const [selectedAdminOption, setSelectedAdminOption] = useState("Pending");
  const [dateFilter, setDateFilter] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);

  const [totals, setTotals] = useState({
    total_admins: 0,
    total_farmers: 0,
    total_buyers: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load KPI totals once
  useEffect(() => {
    (async () => {
      try {
        const t = await fetchUserTotals();
        setTotals(t || { total_admins: 0, total_farmers: 0, total_buyers: 0 });
      } catch (err) {
        console.error("[totals] error:", err);
      }
    })();
  }, []);

  // Load users whenever role / date filter changes
  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const role =
          selectedUserOption === "All"
            ? null
            : selectedUserOption.toLowerCase();

        let createdOn = null;
        if (dateFilter) {
          const d =
            typeof dateFilter === "string"
              ? new Date(dateFilter)
              : new Date(dateFilter);
          createdOn = d.toISOString().slice(0, 10);
        }

        const rows = await fetchUsers({ role, createdOn });
        setUsers(rows);
      } catch (err) {
        console.error("[users] error:", err);
        setErrorUsers(err.message || "Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [selectedUserOption, dateFilter]);

  const adminCount = totals.total_admins ?? 0;
  const farmerCount = totals.total_farmers ?? 0;
  const buyerCount = totals.total_buyers ?? 0;

  const rowsForTable = useMemo(() => users, [users]);

  const handleAddUser = () => setShowAddModal(true);

  const reloadUsers = async () => {
    const role =
      selectedUserOption === "All" ? null : selectedUserOption.toLowerCase();
    const rows = await fetchUsers({ role, createdOn: null });
    setUsers(rows);
  };

  const handleSuspendSelected = async () => {
    if (!selectedIds.length) return;
    if (
      !window.confirm(
        `Suspend ${selectedIds.length} user(s)? They will no longer be able to log in.`
      )
    ) {
      return;
    }
    try {
      await Promise.all(selectedIds.map((id) => suspendUser(id)));
      await reloadUsers();
      setSelectedIds([]);
    } catch (err) {
      alert(err.message || "Failed to suspend users");
    }
  };

  const handleSuspendAll = async () => {
    if (!rowsForTable.length) {
      alert("No users in the current view to suspend.");
      return;
    }
    if (
      !window.confirm(
        `Suspend ALL users in current view (${rowsForTable.length})?`
      )
    ) {
      return;
    }
    try {
      await Promise.all(rowsForTable.map((u) => suspendUser(u.user_id)));
      await reloadUsers();
      setSelectedIds([]);
    } catch (err) {
      alert(err.message || "Failed to suspend all users");
    }
  };

  // called when modal submits
  async function handleCreateUser(formPayload) {
  try {
    setCreating(true);

    // basic validations
    if (!formPayload.email || !formPayload.password) {
      throw new Error("Email and password are required.");
    }
    if (!formPayload.phone) {
      throw new Error("Phone number is required.");
    }
    if (!formPayload.first_name || !formPayload.last_name) {
      throw new Error("First and last name are required.");
    }
    if (
      formPayload.role?.toLowerCase() === "farmer" &&
      !formPayload.coop_name?.trim()
    ) {
      throw new Error("Coop name is required for farmers.");
    }

    // call service (this handles auth.signUp + RPC v3)
    const created = await createUserWithPassword({
      email: formPayload.email,
      password: formPayload.password,
      role: formPayload.role,
      first_name: formPayload.first_name,
      middle_name: formPayload.middle_name,
      last_name: formPayload.last_name,
      phone: formPayload.phone,
      sex: formPayload.sex,
      coop_name: formPayload.coop_name,
      house_number: formPayload.house_number,
      street: formPayload.street,
      barangay: formPayload.barangay,
      city: formPayload.city,
      province: formPayload.province,
      postal_code: formPayload.postal_code,
    });

    // prepend new user to table (service normalizes s_user_id -> user_id)
    if (created) {
      setUsers((prev) => [created, ...prev]);
    }

    // refresh KPI totals (optional)
    try {
      const t = await fetchUserTotals();
      setTotals(t || totals);
    } catch (e) {
      console.warn("[fetchUserTotals] after create failed:", e);
    }

    setShowAddModal(false);
  } catch (err) {
    console.error("[handleCreateUser] failed:", err);
    alert(err.message || "Failed to create user");
  } finally {
    setCreating(false);
  }
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

      

      

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateUser}
          roles={["Admin", "Farmer", "Buyer"]}
          loading={creating}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────
   AddUserModal
   ──────────────────────────────── */
function AddUserModal({ open, onClose, onSave, roles = [], loading }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    sex: "female",
    phone: "",
    email: "",
    password: "",
    role: "Admin",
    coop_name: "",
    house_number: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
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

  const isFarmer = form.role.toLowerCase() === "farmer";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-[900px] max-w-[95vw] bg-white rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-primaryYellow mb-6">
          Add New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names */}
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

          {/* Sex / Phone / Email */}
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

          {/* Role / Coop / Password */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Role</Label>
              <div className="border rounded-xl px-4 py-3 border-gray-300 shadow-sm">
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Field
              label="Coop Name (for Farmers)"
              placeholder={isFarmer ? "Enter Coop Name" : "Not required"}
              value={form.coop_name}
              onChange={(v) => handleChange("coop_name", v)}
              disabled={!isFarmer}
            />

            <Field
              label="Password"
              placeholder="Enter Password"
              type="password"
              value={form.password}
              onChange={(v) => handleChange("password", v)}
            />
          </div>

          {/* Address fields */}
          <div className="grid grid-cols-3 gap-4">
            <Field
              label="House Number"
              placeholder="Enter House Number"
              value={form.house_number}
              onChange={(v) => handleChange("house_number", v)}
            />
            <Field
              label="Street"
              placeholder="Enter Street"
              value={form.street}
              onChange={(v) => handleChange("street", v)}
            />
            <Field
              label="Barangay"
              placeholder="Enter Barangay"
              value={form.barangay}
              onChange={(v) => handleChange("barangay", v)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field
              label="City"
              placeholder="Enter City"
              value={form.city}
              onChange={(v) => handleChange("city", v)}
            />
            <Field
              label="Province"
              placeholder="Enter Province"
              value={form.province}
              onChange={(v) => handleChange("province", v)}
            />
            <Field
              label="Postal Code"
              placeholder="Enter Postal Code"
              value={form.postal_code}
              onChange={(v) => handleChange("postal_code", v)}
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-gray-300 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-primaryYellow text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Adding…" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-gray-700 font-semibold mb-2">
      {children}
    </label>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-3 shadow-sm outline-none focus:ring-2 border-gray-300 focus:ring-yellow-200 disabled:bg-gray-100 disabled:text-gray-400"
      />
    </div>
  );
}

function RadioPill({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-gray-700 transition
        ${
          checked
            ? "border-primaryYellow bg-yellow-50"
            : "border-gray-300 hover:border-primaryYellow"
        }`}
      aria-pressed={checked}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400">
        <span
          className={`w-2 h-2 rounded-full ${
            checked ? "bg-primaryYellow" : "bg-transparent"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
