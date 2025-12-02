// src/pages/super-admin/settings/Settings.jsx (adjust path as needed)
import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchMySettings,
  updateMySettings,
} from "@/services/accountSettings";

export default function Settings() {
  const { user } = useAuth(); // you can still use this for avatar/email etc.

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    sex: "",
    contact_no: "",
    username: "",
    email: "",
    house_number: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Load current user's profile on mount
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchMySettings();
        if (!isMounted) return;
        setForm({
          first_name: data.first_name || "",
          middle_name: data.middle_name || "",
          last_name: data.last_name || "",
          sex: data.sex || "",
          contact_no: data.contact_no || "",
          username: data.username || "",
          email: data.email || "",
          house_number: data.house_number || "",
          street: data.street || "",
          barangay: data.barangay || "",
          city: data.city || "",
          province: data.province || "",
          postal_code: data.postal_code || "",
        });
      } catch (err) {
        console.error("[Settings] fetchMySettings error:", err);
        if (isMounted) {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccessMsg("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg("");
      await updateMySettings(form);
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      console.error("[Settings] updateMySettings error:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-10 py-6 rounded-lg border border-gray-300 shadow-lg mt-5 flex flex-col gap-5">
      {/* Header + avatar */}
      <div className="flex flex-row gap-5 items-center">
        <FaUserCircle className="w-20 h-20 text-gray-400" />
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-primaryYellow">
            {form.first_name || form.last_name
              ? `${form.first_name} ${form.last_name}`
              : user?.email || "My Profile"}
          </p>
          <p className="text-sm text-gray-500">
            {form.email || user?.email}
          </p>
        </div>
      </div>

      {/* Status messages */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading profile…</p>
      )}
      {error && (
        <p className="text-red-600 text-sm font-medium">{error}</p>
      )}
      {successMsg && (
        <p className="text-green-600 text-sm font-medium">
          {successMsg}
        </p>
      )}

      {/* FORM */}
      {!loading && (
        <>
          <div className="space-y-6">
            {/* Row 1: First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={form.first_name}
                  onChange={(e) =>
                    handleChange("first_name", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={form.last_name}
                  onChange={(e) =>
                    handleChange("last_name", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Row 2: Middle Name, Sex, Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="middleName"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  Middle Name{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={form.middle_name}
                  onChange={(e) =>
                    handleChange("middle_name", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="sex"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  Sex
                </label>
                <select
                  id="sex"
                  name="sex"
                  value={form.sex}
                  onChange={(e) => handleChange("sex", e.target.value)}
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="phone"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.contact_no}
                  onChange={(e) =>
                    handleChange("contact_no", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Row 3: Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="username"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={(e) =>
                    handleChange("username", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="block text-sm md:text-base font-semibold text-yellow-400"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Row 4: Address fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="block text-sm md:text-base font-semibold text-yellow-400">
                  House Number
                </label>
                <input
                  type="text"
                  value={form.house_number}
                  onChange={(e) =>
                    handleChange("house_number", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm md:text-base font-semibold text-yellow-400">
                  Street
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) =>
                    handleChange("street", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm md:text-base font-semibold text-yellow-400">
                  Barangay
                </label>
                <input
                  type="text"
                  value={form.barangay}
                  onChange={(e) =>
                    handleChange("barangay", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="block text-sm md:text-base font-semibold text-yellow-400">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    handleChange("city", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm md:text-base font-semibold text-yellow-400">
                  Province
                </label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) =>
                    handleChange("province", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm md:text-base font-semibold text-yellow-400">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) =>
                    handleChange("postal_code", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-primaryYellow text-white font-semibold rounded-lg px-6 py-2 hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
