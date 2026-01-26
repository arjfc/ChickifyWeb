// src/pages/super-admin/user-management/EditAdmin.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchUserById,
  updateUserProfile,
  suspendUser,
} from "@/services/superAdminUsers";

export default function EditAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: initialUser } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(initialUser || null);
  const [form, setForm] = useState({
    user_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    sex: "female",
    phone: "",
    email: "",
    username: "", // if you later add this
    house_number: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
  });

  // If user not fully provided, fetch from RPC by id
  useEffect(() => {
    (async () => {
      if (!initialUser && location.state?.user_id) {
        try {
          setLoading(true);
          const row = await fetchUserById(location.state.user_id);
          setUser(row);
        } catch (err) {
          console.error(err);
          alert(err.message || "Failed to load user");
        } finally {
          setLoading(false);
        }
      } else if (initialUser) {
        setUser(initialUser);
      }
    })();
  }, [initialUser, location.state]);

  // Sync form whenever user changes
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      user_id: user.user_id,
      first_name: user.first_name || "",
      middle_name: user.middle_name || "",
      last_name: user.last_name || "",
      sex: user.sex || "female",
      phone: user.phone || "",
      email: user.email || "",
      username: user.username || "",
      house_number: user.house_number || "",
      street: user.street || "",
      barangay: user.barangay || "",
      city: user.city || "",
      province: user.province || "",
      postal_code: user.postal_code || "",
    }));
  }, [user]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(form);
      alert("User updated successfully.");
      navigate("/super-admin/users");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!form.user_id) return;
    if (
      !window.confirm(
        "Suspend this account? The user will no longer be able to log in."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await suspendUser(form.user_id);
      alert("Account suspended.");
      navigate("/super-admin/users");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to suspend account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="mt-10 ml-4">Loading…</p>;
  if (!form.user_id)
    return <p className="mt-10 ml-4">No user data provided.</p>;

  return (
    <div className="flex flex-col items-start mt-10 ml-1">
      <div className="relative w-full max-w-6xl bg-white rounded-xl border border-gray-300 shadow-lg px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-primaryYellow mb-2">
          Edit Admin&apos;s Profile
        </h1>
        {user?.last_login && (
          <p className="text-sm text-gray-500 mb-4">
            Last online: {new Date(user.last_login).toLocaleString()}
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Names row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="First Name"
              value={form.first_name}
              onChange={(v) => handleChange("first_name", v)}
            />
            <Field
              label="Last Name"
              value={form.last_name}
              onChange={(v) => handleChange("last_name", v)}
            />
          </div>

          {/* Middle / Sex / Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="Middle Name (Optional)"
              value={form.middle_name}
              onChange={(v) => handleChange("middle_name", v)}
            />
            <div>
              <Label>Sex</Label>
              <select
                value={form.sex}
                onChange={(e) => handleChange("sex", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <Field
              label="Phone Number"
              value={form.phone}
              onChange={(v) => handleChange("phone", v)}
            />
          </div>

          {/* Username / Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Username"
              value={form.username}
              onChange={(v) => handleChange("username", v)}
              // you can disable if username isn't editable yet
            />
            <Field
              label="E-mail"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
              disabled // usually email is managed by auth
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="House Number"
              value={form.house_number}
              onChange={(v) => handleChange("house_number", v)}
            />
            <Field
              label="Street"
              value={form.street}
              onChange={(v) => handleChange("street", v)}
            />
            <Field
              label="Barangay"
              value={form.barangay}
              onChange={(v) => handleChange("barangay", v)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label="City"
              value={form.city}
              onChange={(v) => handleChange("city", v)}
            />
            <Field
              label="Province"
              value={form.province}
              onChange={(v) => handleChange("province", v)}
            />
            <Field
              label="Postal Code"
              value={form.postal_code}
              onChange={(v) => handleChange("postal_code", v)}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4">
            <button
              type="button"
              className="cursor-pointer text-sm rounded-lg font-bold shadow-md px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => navigate("/super-admin/users")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="cursor-pointer text-sm rounded-lg font-bold shadow-md px-6 py-2 bg-red-500 text-white hover:bg-red-600"
              onClick={handleSuspend}
              disabled={saving}
            >
              Suspend Account
            </button>

            <button
              type="submit"
              className="cursor-pointer text-sm rounded-lg text-white font-bold shadow-md px-6 py-2"
              style={{ backgroundColor: "#FEC617" }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-sm font-semibold text-gray-500 mb-1">
      {children}
    </label>
  );
}

function Field({ label, value, onChange, disabled }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
      />
    </div>
  );
}
