import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function ViewAdmin() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = state?.user;

  if (!user) return <p>No user data provided</p>;

  const labelCls = "block text-sm font-semibold text-gray-400";
  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm focus:outline-none";
  const notProvided = (v) => (v ? v : "Not provided");

  // 🔹 Build full address from individual fields
  const fullAddress = [
    user.house_number,
    user.street,
    user.barangay,
    user.city,
    user.province,
    user.postal_code,
  ]
    .filter(Boolean)          // remove undefined / empty parts
    .join(", ");

  return (
    <div className="w-full">
      <div className="mt-10 ml-0 w-full rounded-2xl border border-gray-300 bg-white px-10 pt-8 pb-10 shadow-lg">
        {/* Avatar + name */}
        <div className="flex items-center gap-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="h-24 w-24 text-gray-400" />
          )}
          <div>
            <p className="text-2xl font-semibold text-primaryYellow">
              {user.name ||
                `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                "Admin FullName"}
            </p>
            <p className="text-base text-gray-500">
              {user.username ? `@${user.username}` : "@username"}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 space-y-8">
          {/* Email / Sex / Phone */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={labelCls}>
                E-mail
              </label>
              <input
                id="email"
                type="text"
                value={notProvided(user.email)}
                readOnly
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="sex" className={labelCls}>
                Sex
              </label>
              <input
                id="sex"
                type="text"
                value={notProvided(user.sex)}
                readOnly
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className={labelCls}>
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={notProvided(user.phone)}
                readOnly
                className={inputCls}
              />
            </div>
          </div>

          {/* 🔹 Full Address */}
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className={labelCls}>
              Address
            </label>
            <textarea
              id="address"
              rows={1}
              value={notProvided(fullAddress)}
              readOnly
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate("/super-admin/users")}
          className="rounded-xl bg-primaryYellow px-12 py-2 text-md font-bold text-white shadow-sm hover:opacity-90"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default ViewAdmin;
