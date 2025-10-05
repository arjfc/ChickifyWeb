import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  console.log(user);

  return (
    <div className="px-10 py-6 rounded-lg border border-gray-300 shadow-lg mt-5 flex flex-col gap-5">
      <div className="flex flex-row gap-5 items-center">
        <FaUserCircle className="w-25 h-25" />
        <div className="flex gap-5 h-full items-end">
          <div
            onClick={() => alert("clicked")}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Edit Profile</p>
          </div>
          <div
            onClick={() => alert("clicked")}
            className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-lg">Change Password</p>
          </div>
        </div>
      </div>
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
              value={user.firstName}
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
              value={user.lastName}
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
              Middle Name <span className="text-gray-400">{`(Optional)`}</span>
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
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
              value={user.sex}
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
              value={user.phoneNumber}
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
              value={user.username}
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
              value={user.email}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Row 4: Address */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="address"
            className="block text-sm md:text-base font-semibold text-yellow-400"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={user.address}
            rows={3}
            className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-15"
          />
        </div>
      </div>
    </div>
  );
}
