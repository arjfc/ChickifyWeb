// import React from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { useAuth } from "../../../context/AuthContext";

// export default function Settings() {
//   const { user } = useAuth();

//   console.log(user);

//   return (
//     <div className="px-10 ml-1 py-6 rounded-lg border border-gray-200 shadow-lg mt-5 flex flex-col gap-5">
//       <div className="flex flex-row gap-5 items-center">
//         <FaUserCircle className="w-25 h-25" />
//         <div className="flex gap-5 h-full items-end">
//           <div
//             onClick={() => alert("clicked")}
//             className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//           >
//             <p className="text-md">Edit Profile</p>
//           </div>
//           <div
//             onClick={() => alert("clicked")}
//             className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//           >
//             <p className="text-md">Change Password</p>
//           </div>
//         </div>
//       </div>
//       <div className="space-y-6">
//         {/* Row 1: First & Last Name */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="firstName"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               First Name
//             </label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={user.firstName}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="lastName"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Last Name
//             </label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={user.lastName}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Row 2: Middle Name, Sex, Phone Number */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="middleName"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Middle Name <span className="text-gray-400">{`(Optional)`}</span>
//             </label>
//             <input
//               type="text"
//               id="middleName"
//               name="middleName"
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="sex"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Sex
//             </label>
//             <select
//               id="sex"
//               name="sex"
//               value={user.sex}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             >
//               <option value="">Select</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//             </select>
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="phone"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={user.phoneNumber}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Row 3: Username & Email */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="username"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               name="username"
//               value={user.username}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="email"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={user.email}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Row 4: Address */}
//         {/* <div className="flex flex-col gap-1">
//           <label
//             htmlFor="address"
//             className="block text-sm md:text-base font-semibold text-yellow-400"
//           >
//             Address
//           </label>
//           <textarea
//             id="address"
//             name="address"
//             value={user.address}
//             rows={2}
//             className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-15"
//           />
//         </div> */}

//         {/* --- Added: Address Breakdown --- */}
// <div className="space-y-4">
//   <p className="text-base font-semibold text-gray-700">Additional Address Details</p>

//   {/* Province, Municipal, Barangay */}
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     <div className="flex flex-col gap-1">
//       <label htmlFor="province" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Province
//       </label>
//       <input
//         type="text"
//         id="province"
//         name="province"
//         value={user.province || ""}
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>

//     <div className="flex flex-col gap-1">
//       <label htmlFor="municipal" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Municipal
//       </label>
//       <input
//         type="text"
//         id="municipal"
//         name="municipal"
//         value={user.municipal || user.municipality || ""}
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>

//     <div className="flex flex-col gap-1">
//       <label htmlFor="barangay" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Barangay
//       </label>
//       <input
//         type="text"
//         id="barangay"
//         name="barangay"
//         value={user.barangay || ""}
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>
//   </div>

//   {/* Street (optional), House No. (optional), Zip Code */}
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     <div className="flex flex-col gap-1">
//       <label htmlFor="streetName" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Street Name <span className="text-gray-400">(optional)</span>
//       </label>
//       <input
//         type="text"
//         id="streetName"
//         name="streetName"
//         value={user.streetName || ""}
//         placeholder="e.g., P. Del Rosario St."
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>

//     <div className="flex flex-col gap-1">
//       <label htmlFor="houseNumber" className="block text-sm md:text-base font-semibold text-yellow-400">
//         House Number <span className="text-gray-400">(optional)</span>
//       </label>
//       <input
//         type="text"
//         id="houseNumber"
//         name="houseNumber"
//         value={user.houseNumber || ""}
//         placeholder="e.g., 123-A"
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>

//     <div className="flex flex-col gap-1">
//       <label htmlFor="zipCode" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Zip Code
//       </label>
//       <input
//         type="text"
//         id="zipCode"
//         name="zipCode"
//         value={user.zipCode || ""}
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>
//   </div>

//   {/* Latitude, Longitude */}
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     <div className="flex flex-col gap-1">
//       <label htmlFor="latitude" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Latitude
//       </label>
//       <input
//         type="text"
//         id="latitude"
//         name="latitude"
//         value={user.latitude ?? ""}
//         placeholder="e.g., 10.3157"
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>

//     <div className="flex flex-col gap-1">
//       <label htmlFor="longitude" className="block text-sm md:text-base font-semibold text-yellow-400">
//         Longitude
//       </label>
//       <input
//         type="text"
//         id="longitude"
//         name="longitude"
//         value={user.longitude ?? ""}
//         placeholder="e.g., 123.8854"
//         className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                    focus:ring-2 focus:ring-yellow-400"
//       />
//     </div>

//     {/* spacer to balance the 3-col grid */}
//     <div className="hidden md:block" />
//   </div>
// </div>
//       </div>
//     </div>
//   );
// }


// import React, { useMemo, useState } from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { useAuth } from "../../../context/AuthContext";

// export default function Settings() {
//   const { user } = useAuth();

//   console.log(user);

//   // --- Minimal sample dataset (replace with your municipalities.ts / real LGU data) ---
//   const PH_LGU = {
//     Cebu: {
//       "Cebu City": ["Lahug", "Tisa", "Mabolo"],
//       "Bantayan Island": ["Atop-Stop", "Baigad", "Baod"],
//     },
//     "Negros Occidental": {
//       "Bacolod City": ["Mandalagan", "Tangub"],
//     },
//   };

//   // State for the 3 dropdowns (seeded from user)
//   const [province, setProvince] = useState(user?.province || "");
//   const [municipal, setMunicipal] = useState(user?.municipal || user?.municipality || "");
//   const [barangay, setBarangay] = useState(user?.barangay || "");

//   // Options computed from dataset
//   const provinces = useMemo(() => Object.keys(PH_LGU), []);
//   const municipals = useMemo(
//     () => (province ? Object.keys(PH_LGU[province] || {}) : []),
//     [province]
//   );
//   const barangays = useMemo(
//     () => (province && municipal ? PH_LGU[province]?.[municipal] || [] : []),
//     [province, municipal]
//   );

//   // Helpers to include current value if it's not in the dataset (so it still shows)
//   const ensureOption = (list, current) =>
//     current && !list.includes(current) ? [current, ...list] : list;

//   const provincesWithCurrent = ensureOption(provinces, province);
//   const municipalsWithCurrent = ensureOption(municipals, municipal);
//   const barangaysWithCurrent = ensureOption(barangays, barangay);

//   return (
//     <div className="px-10 ml-1 py-6 rounded-lg border border-gray-200 shadow-lg mt-5 flex flex-col gap-5">
//       <div className="flex flex-row gap-5 items-center">
//         <FaUserCircle className="w-25 h-25" />
//         <div className="flex gap-5 h-full items-end">
//           <div
//             onClick={() => alert("clicked")}
//             className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//           >
//             <p className="text-md">Edit Profile</p>
//           </div>
//           <div
//             onClick={() => alert("clicked")}
//             className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
//           >
//             <p className="text-md">Change Password</p>
//           </div>
//         </div>
//       </div>

//       <div className="space-y-6">
//         {/* Row 1: First & Last Name */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="firstName"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               First Name
//             </label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={user.firstName}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="lastName"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Last Name
//             </label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={user.lastName}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Row 2: Middle Name, Sex, Phone Number */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="middleName"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Middle Name <span className="text-gray-400">{`(Optional)`}</span>
//             </label>
//             <input
//               type="text"
//               id="middleName"
//               name="middleName"
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="sex"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Sex
//             </label>
//             <select
//               id="sex"
//               name="sex"
//               value={user.sex}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             >
//               <option value="">Select</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//             </select>
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="phone"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={user.phoneNumber}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Row 3: Username & Email */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="username"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               name="username"
//               value={user.username}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div className="flex flex-col gap-1">
//             <label
//               htmlFor="email"
//               className="block text-sm md:text-base font-semibold text-yellow-400"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={user.email}
//               className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Row 4: Address */}
//         <div className="flex flex-col gap-1">
//           <label
//             htmlFor="address"
//             className="block text-sm md:text-base font-semibold text-yellow-400"
//           >
//             Address
//           </label>
//           <textarea
//             id="address"
//             name="address"
//             value={user.address}
//             rows={2}
//             className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-15"
//           />
//         </div>

//         {/* --- Added: Address Breakdown with DROPDOWNS --- */}
//         <div className="space-y-4">
//           <p className="text-base font-semibold text-gray-700">Additional Address Details</p>

//           {/* Province, Municipal, Barangay (DROPDOWNS) */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="province"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Province
//               </label>
//               <select
//                 id="province"
//                 value={province}
//                 onChange={(e) => {
//                   setProvince(e.target.value);
//                   setMunicipal("");
//                   setBarangay("");
//                 }}
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400"
//               >
//                 <option value="">Select Province</option>
//                 {provincesWithCurrent.map((p) => (
//                   <option key={p} value={p}>
//                     {p}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="municipal"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Municipal
//               </label>
//               <select
//                 id="municipal"
//                 value={municipal}
//                 onChange={(e) => {
//                   setMunicipal(e.target.value);
//                   setBarangay("");
//                 }}
//                 disabled={!province}
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
//               >
//                 <option value="">
//                   {province ? "Select Municipal" : "Choose province first"}
//                 </option>
//                 {municipalsWithCurrent.map((m) => (
//                   <option key={m} value={m}>
//                     {m}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="barangay"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Barangay
//               </label>
//               <select
//                 id="barangay"
//                 value={barangay}
//                 onChange={(e) => setBarangay(e.target.value)}
//                 disabled={!municipal}
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
//               >
//                 <option value="">
//                   {municipal ? "Select Barangay" : "Choose municipal first"}
//                 </option>
//                 {barangaysWithCurrent.map((b) => (
//                   <option key={b} value={b}>
//                     {b}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Street (optional), House No. (optional), Zip Code */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="streetName"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Street Name <span className="text-gray-400">(optional)</span>
//               </label>
//               <input
//                 type="text"
//                 id="streetName"
//                 name="streetName"
//                 value={user.streetName || ""}
//                 placeholder="e.g., P. Del Rosario St."
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="houseNumber"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 House Number <span className="text-gray-400">(optional)</span>
//               </label>
//               <input
//                 type="text"
//                 id="houseNumber"
//                 name="houseNumber"
//                 value={user.houseNumber || ""}
//                 placeholder="e.g., 123-A"
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="zipCode"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Zip Code
//               </label>
//               <input
//                 type="text"
//                 id="zipCode"
//                 name="zipCode"
//                 value={user.zipCode || ""}
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>
//           </div>

//           {/* Latitude, Longitude */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="latitude"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Latitude
//               </label>
//               <input
//                 type="text"
//                 id="latitude"
//                 name="latitude"
//                 value={user.latitude ?? ""}
//                 placeholder="e.g., 10.3157"
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label
//                 htmlFor="longitude"
//                 className="block text-sm md:text-base font-semibold text-yellow-400"
//               >
//                 Longitude
//               </label>
//               <input
//                 type="text"
//                 id="longitude"
//                 name="longitude"
//                 value={user.longitude ?? ""}
//                 placeholder="e.g., 123.8854"
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none
//                            focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             {/* spacer */}
//             <div className="hidden md:block" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useMemo, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  // state to lock/unlock form
  const [isEditing, setIsEditing] = useState(false);

  const PH_LGU = {
    Cebu: {
      "Cebu City": ["Lahug", "Tisa", "Mabolo"],
      "Bantayan Island": ["Atop-Stop", "Baigad", "Baod"],
    },
    "Negros Occidental": {
      "Bacolod City": ["Mandalagan", "Tangub"],
    },
  };

  const [province, setProvince] = useState(user?.province || "");
  const [municipal, setMunicipal] = useState(user?.municipal || user?.municipality || "");
  const [barangay, setBarangay] = useState(user?.barangay || "");

  const provinces = useMemo(() => Object.keys(PH_LGU), []);
  const municipals = useMemo(
    () => (province ? Object.keys(PH_LGU[province] || {}) : []),
    [province]
  );
  const barangays = useMemo(
    () => (province && municipal ? PH_LGU[province]?.[municipal] || [] : []),
    [province, municipal]
  );

  const ensureOption = (list, current) =>
    current && !list.includes(current) ? [current, ...list] : list;

  const provincesWithCurrent = ensureOption(provinces, province);
  const municipalsWithCurrent = ensureOption(municipals, municipal);
  const barangaysWithCurrent = ensureOption(barangays, barangay);

  return (
    <div className="px-10 ml-1 py-6 rounded-lg border border-gray-200 shadow-lg mt-5 flex flex-col gap-5">
      <div className="flex flex-row gap-5 items-center">
        <FaUserCircle className="w-25 h-25" />
        <div className="flex gap-5 h-full items-end">
          <div
            onClick={() => setIsEditing(!isEditing)}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-md">{isEditing ? "Cancel" : "Edit Profile"}</p>
          </div>
          <div
            onClick={() => alert("clicked")}
            className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 cursor-pointer hover:opacity-90"
          >
            <p className="text-md">Change Password</p>
          </div>
        </div>
      </div>

      

      <div className="space-y-6">
        {/* Row 1: First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="block text-sm md:text-base font-semibold text-yellow-400">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={user.firstName}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="block text-sm md:text-base font-semibold text-yellow-400">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={user.lastName}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Row 2: Middle Name, Sex, Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="middleName" className="block text-sm md:text-base font-semibold text-yellow-400">
              Middle Name <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="sex" className="block text-sm md:text-base font-semibold text-yellow-400">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              value={user.sex}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="block text-sm md:text-base font-semibold text-yellow-400">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={user.phoneNumber}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Row 3: Username & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="block text-sm md:text-base font-semibold text-yellow-400">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="block text-sm md:text-base font-semibold text-yellow-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Row 4: Address */}
        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="block text-sm md:text-base font-semibold text-yellow-400">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={user.address}
            rows={2}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-15 disabled:bg-gray-100"
          />
        </div>

        {/* Province / Municipal / Barangay */}
      <p className="text-base font-semibold text-gray-700">Address Details</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="province" className="block text-sm md:text-base font-semibold text-yellow-400">
              Province
            </label>
            <select
              id="province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setMunicipal("");
                setBarangay("");
              }}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            >
              <option value="">Select Province</option>
              {provincesWithCurrent.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="municipal" className="block text-sm md:text-base font-semibold text-yellow-400">
              Municipal
            </label>
            <select
              id="municipal"
              value={municipal}
              onChange={(e) => {
                setMunicipal(e.target.value);
                setBarangay("");
              }}
              disabled={!isEditing || !province}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            >
              <option value="">
                {province ? "Select Municipal" : "Choose province first"}
              </option>
              {municipalsWithCurrent.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="barangay" className="block text-sm md:text-base font-semibold text-yellow-400">
              Barangay
            </label>
            <select
              id="barangay"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              disabled={!isEditing || !municipal}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            >
              <option value="">
                {municipal ? "Select Barangay" : "Choose municipal first"}
              </option>
              {barangaysWithCurrent.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Street, House No, Zip Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="streetName" className="block text-sm md:text-base font-semibold text-yellow-400">
              Street Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="streetName"
              name="streetName"
              value={user.streetName || ""}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="houseNumber" className="block text-sm md:text-base font-semibold text-yellow-400">
              House Number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="houseNumber"
              name="houseNumber"
              value={user.houseNumber || ""}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="zipCode" className="block text-sm md:text-base font-semibold text-yellow-400">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={user.zipCode || ""}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Latitude / Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="latitude" className="block text-sm md:text-base font-semibold text-yellow-400">
              Latitude
            </label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={user.latitude ?? ""}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="longitude" className="block text-sm md:text-base font-semibold text-yellow-400">
              Longitude
            </label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={user.longitude ?? ""}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            />
          </div>

          {/* Save button - only appears when editing */}
        {isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                alert("Profile saved!");
                setIsEditing(false);
              }}
              className="bg-primaryYellow text-white font-bold rounded-md px-9 py-2 hover:opacity-90"
            >
              Save
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
