import React from 'react'
import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa6";

export default function EditAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  if (!user) return <p>No user data provided</p>;

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="relative w-full max-w-4xl bg-white rounded-xl border border-gray-200 shadow-lg px-8 py-8 space-y-6">
        
        {/* Profile Image + Upload + Reset Password */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <FaUserCircle className="w-16 h-16 text-gray-400" />
            <div>
              <label htmlFor='uploadImg' className="block text-sm font-semibold text-gray-500">
                Upload image <span className="text-xs text-gray-400">(Optional)</span>
              </label>
              <div className="flex items-center mt-1 text-sm text-gray-500 border rounded-md cursor-pointer px-4 py-2 gap-2">
                <FaUpload className='cursor-pointer'/>
                <input
                  type="file"
                  className="cursor-pointer text-sm"
                  name='uploadImg'
                />
              </div>
            </div>
          </div>
          <button className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-200">
            Reset Password
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Row 1: First + Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-500">First Name</label>
            <input
              type="text"
              defaultValue={user.firstName || ""}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500">Last Name</label>
            <input
              type="text"
              defaultValue={user.lastName || ""}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Row 2: Middle Name + Sex + Phone */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500">Middle Name (Optional)</label>
              <input
                type="text"
                defaultValue={user.middleName || ""}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">Sex</label>
              <select
                defaultValue={user.sex || ""}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500">Phone Number</label>
              <input
                type="tel"
                defaultValue={user.phone || ""}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Row 3: Username + Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-500">Username</label>
            <input
              type="text"
              defaultValue={user.username || ""}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500">E-mail</label>
            <input
              type="text"
              defaultValue={user.email || ""}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Row 4: Address full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-500">Address</label>
            <input
              type="text"
              defaultValue={user.address || ""}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            className="cursor-pointer text-sm rounded-lg text-primaryYellow font-bold shadow-md bg-yellow-100 px-6 py-2"
            onClick={() => navigate('/super-admin/users')}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer text-sm rounded-lg text-white font-bold shadow-md bg-primaryYellow px-6 py-2"
            onClick={() => navigate('/super-admin/users')}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
