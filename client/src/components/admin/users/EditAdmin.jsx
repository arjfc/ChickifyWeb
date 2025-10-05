import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  if (!user) return <p>No user data provided</p>;

  return (
    <div className="w-full">
      <div className="mt-10 ml-0 w-full max-w-8xl rounded-2xl border border-gray-300 bg-white px-12 pt-10 pb-12 shadow-lg">
        {/* Profile Image + Name */}
        <div className="flex items-center gap-4">
          <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={`${user.firstName || ""} ${user.lastName || ""}`}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: First + Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-400">
              First Name
            </label>
            <input
              type="text"
              defaultValue={user.firstName || ""}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400">
              Last Name
            </label>
            <input
              type="text"
              defaultValue={user.lastName || ""}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Row 2: Middle Name + Sex + Phone */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400">
                Middle Name (Optional)
              </label>
              <input
                type="text"
                defaultValue={user.middleName || ""}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400">
                Sex
              </label>
              <select
                defaultValue={user.sex || ""}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue={user.phoneNumber || ""}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Row 3: Username + Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-400">
              Username
            </label>
            <input
              type="text"
              defaultValue={user.username || ""}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400">
              E-mail
            </label>
            <input
              type="text"
              defaultValue={user.email || ""}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Row 4: Address full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-400">
              Address
            </label>
            <textarea
              rows={2}
              defaultValue={user.address || ""}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            className="w-full sm:w-auto mt-4 cursor-pointer text-base sm:text-md rounded-lg text-primaryYellow font-bold shadow-md bg-yellow-100 px-6 sm:px-8 py-2 sm:py-3 hover:bg-yellow-200"
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </button>
          <button
            className="w-full sm:w-auto mt-4 cursor-pointer text-base sm:text-md rounded-lg text-white font-bold shadow-md bg-primaryYellow px-6 sm:px-8 py-2 sm:py-3 hover:opacity-90"
            onClick={() => navigate("/admin/users")}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
