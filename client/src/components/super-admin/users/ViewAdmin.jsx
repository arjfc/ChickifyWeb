// // import { FaUserCircle } from "react-icons/fa";
// // import { useLocation, useNavigate } from "react-router-dom";


// // function ViewAdmin() {
// //   const { state } = useLocation();
// //   const navigate = useNavigate();
// //   const user = state?.user;

// //   if (!user) return <p>No user data provided</p>;

// //   const labelCls = "block text-sm font-semibold text-gray-400";
// //   const inputCls = "w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm focus:outline-none";
// //   const notProvided = (v) => (v ? v : "Not provided");

// //   return (
// //     <div className="w-full">
// //       {/* Profile Card - flush left & responsive wider */}
// //       <div className="mt-10 ml-0 w-full max-w-8xl rounded-2xl border border-gray-300 bg-white px-12 pt-10 pb-12 shadow-lg">
// //         {/* Profile header row */}
// //         <div className="flex items-center gap-6">
// //           {user.avatarUrl ? (
// //             <img
// //               src={user.avatarUrl}
// //               alt="avatar"
// //               className="h-28 w-28 rounded-full object-cover"
// //             />
// //           ) : (
// //             <FaUserCircle className="h-28 w-28 text-gray-400" />
// //           )}
// //           <div>
// //             <p className="text-2xl font-semibold text-primaryYellow">
// //               {user.name || "Admin FullName"}
// //             </p>
// //             <p className="text-base text-gray-500">
// //               {user.username ? `@${user.username}` : "@username"}
// //             </p>
// //           </div>
// //         </div>

// //         {/* Fields */}
// //         <div className="mt-10 space-y-8">
// //           {/* Row 1 */}
// //           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
// //             <div className="flex flex-col gap-2">
// //               <label htmlFor="email" className={labelCls}>
// //                 E-mail
// //               </label>
// //               <input
// //                 id="email"
// //                 type="text"
// //                 value={notProvided(user.email)}
// //                 readOnly
// //                 className={inputCls}
// //               />
// //             </div>

// //             <div className="flex flex-col gap-2">
// //               <label htmlFor="sex" className={labelCls}>
// //                 Sex
// //               </label>
// //               <input
// //                 id="sex"
// //                 type="text"
// //                 value={notProvided(user.sex)}
// //                 readOnly
// //                 className={inputCls}
// //               />
// //             </div>

// //             <div className="flex flex-col gap-2">
// //               <label htmlFor="phone" className={labelCls}>
// //                 Phone Number
// //               </label>
// //               <input
// //                 id="phone"
// //                 type="text"
// //                 value={notProvided(user.phone)}
// //                 readOnly
// //                 className={inputCls}
// //               />
// //             </div>
// //           </div>

// //           {/* Address full width */}
// //           <div className="flex flex-col gap-2">
// //             <label htmlFor="address" className={labelCls}>
// //               Address
// //             </label>
// //             <textarea
// //               id="address"
// //               rows={1}
// //               value={notProvided(user.address)}
// //               readOnly
// //               className={`${inputCls} resize-none`}
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Back button OUTSIDE the card, centered */}
// //       <div className="mt-8 flex justify-center">
// //         <button
// //           onClick={() => navigate("/super-admin/users")}
// //           className="rounded-xl bg-primaryYellow px-14 py-3 text-lg font-bold text-white shadow-sm hover:opacity-90"
// //         >
// //           Back
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ViewAdmin;


// import React from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { LuEye, LuPencil } from "react-icons/lu";
// import { IoChevronDown } from "react-icons/io5";
// import { useLocation, useNavigate } from "react-router-dom";

// function ViewAdmin() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const user = state?.user;

//   if (!user) return <p>No user data provided</p>;

//   const labelCls = "block text-sm font-semibold text-gray-400";
//   const inputCls =
//     "w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm focus:outline-none";
//   const notProvided = (v) => (v ? v : "Not provided"); // 👈 JS only

//   // --- mock data for the table (as in the image)
//   const rows = [
//     { id: 1, name: "Maria Lopez", email: "farmer@gmail.com", role: "Farmer", status: "Active" },
//     { id: 2, name: "Flynn Roger", email: "buyer@gmail.com", role: "Buyer", status: "Active" },
//     { id: 3, name: "Maria Lopez", email: "farmer@gmail.com", role: "Farmer", status: "Active" },
//     { id: 4, name: "Flynn Roger", email: "buyer@gmail.com", role: "Buyer", status: "Active" },
//     { id: 5, name: "Flynn Roger", email: "buyer@gmail.com", role: "Buyer", status: "Active" },
//   ];

//   return (
//     <div className="w-full">
//       {/* Profile Card */}
//       <div className="mt-10 ml-0 w-full rounded-2xl border border-gray-300 bg-white px-10 pt-8 pb-10 shadow-lg">
//         {/* Header */}
//         <div className="flex items-center gap-6">
//           {user.avatarUrl ? (
//             <img
//               src={user.avatarUrl}
//               alt="avatar"
//               className="h-24 w-24 rounded-full object-cover"
//             />
//           ) : (
//             <FaUserCircle className="h-24 w-24 text-gray-400" />
//           )}
//           <div>
//             <p className="text-2xl font-semibold text-primaryYellow">
//               {user.name || "Admin FullName"}
//             </p>
//             <p className="text-base text-gray-500">
//               {user.username ? `@${user.username}` : "@username"}
//             </p>
//           </div>
//         </div>

//         {/* Fields */}
//         <div className="mt-8 space-y-8">
//           {/* Row 1 */}
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             <div className="flex flex-col gap-2">
//               <label htmlFor="email" className={labelCls}>E-mail</label>
//               <input id="email" type="text" value={notProvided(user.email)} readOnly className={inputCls} />
//             </div>

//             <div className="flex flex-col gap-2">
//               <label htmlFor="sex" className={labelCls}>Sex</label>
//               <input id="sex" type="text" value={notProvided(user.sex)} readOnly className={inputCls} />
//             </div>

//             <div className="flex flex-col gap-2">
//               <label htmlFor="phone" className={labelCls}>Phone Number</label>
//               <input id="phone" type="text" value={notProvided(user.phone)} readOnly className={inputCls} />
//             </div>
//           </div>

//           {/* Address full width */}
//           <div className="flex flex-col gap-2">
//             <label htmlFor="address" className={labelCls}>Address</label>
//             <textarea
//               id="address"
//               rows={1}
//               value={notProvided(user.address)}
//               readOnly
//               className={`${inputCls} resize-none`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Section title */}
//       <h2 className="mt-8 mb-3 text-2xl font-semibold text-primaryYellow">
//         List of Famers Under Admin
//       </h2>

//       {/* Table Card */}
//       <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
//         {/* Table Header (yellow) */}
//         <div className="flex items-center rounded-t-2xl bg-primaryYellow px-6 py-4 text-sm font-semibold text-black">
//           <div className="w-10">
//             <input type="checkbox" className="h-4 w-4 accent-black/80" aria-label="select-all" />
//           </div>
//           <div className="flex-1">Full Name</div>
//           <div className="flex-1">Email</div>
//           <div className="w-32">Role</div>
//           <div className="w-28">Status</div>
//           <div className="w-40">Actions</div>
//         </div>

//         {/* Rows */}
//         <div className="divide-y divide-gray-100">
//           {rows.map((r) => (
//             <div key={r.id} className="flex items-center px-6 py-4 text-sm">
//               <div className="w-10">
//                 <input type="checkbox" className="h-4 w-4 accent-primaryYellow" />
//               </div>
//               <div className="flex-1 text-gray-700">{r.name}</div>
//               <div className="flex-1 text-gray-700">{r.email}</div>
//               <div className="w-32 text-gray-700">{r.role}</div>
//               <div className="w-28 text-gray-700">{r.status}</div>

//               {/* Actions */}
//               <div className="w-40">
//                 <div className="flex items-center gap-3">
//                   <button type="button" className="inline-flex items-center overflow-hidden rounded-lg shadow-sm">
//                     <span className="flex items-center gap-2 bg-primaryYellow px-3 py-1.5 text-white">
//                       <LuEye className="h-4 w-4" />
//                       <span className="text-sm font-medium">View</span>
//                     </span>
//                   </button>

//                   <button
//                     type="button"
//                     className="inline-flex items-center overflow-hidden rounded-lg border border-yellow-300 bg-yellow-50 shadow-sm"
//                   >
//                     <span className="flex items-center gap-2 px-3 py-1.5 text-yellow-700">
//                       <LuPencil className="h-4 w-4" />
//                       <span className="text-sm font-medium">Edit</span>
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Footer controls */}
//         <div className="flex items-center justify-between px-6 py-4">
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <div className="relative">
//               <select className="appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-gray-700" defaultValue="1">
//                 <option>1</option>
//                 <option>5</option>
//                 <option>10</option>
//               </select>
//               <IoChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500" />
//             </div>
//             <span>Displaying 4 out of 4</span>
//           </div>

//           <div className="flex items-center gap-3">
//             <button className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
//               Previous
//             </button>
//             <button className="rounded-lg bg-yellow-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-yellow-300">
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Back button */}
//       <div className="mt-8 flex justify-center">
//         <button
//           onClick={() => navigate("/super-admin/users")}
//           className="rounded-xl bg-primaryYellow px-14 py-3 text-lg font-bold text-white shadow-sm hover:opacity-90"
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ViewAdmin;

// import React from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { IoChevronDown } from "react-icons/io5";
// import { useLocation, useNavigate } from "react-router-dom";

// function ViewAdmin() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const user = state?.user;

//   if (!user) return <p>No user data provided</p>;

//   const labelCls = "block text-sm font-semibold text-gray-400";
//   const inputCls =
//     "w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm focus:outline-none";
//   const notProvided = (v) => (v ? v : "Not provided");

//   // mock table data
//   const rows = [
//     { id: 1, name: "Maria Lopez", email: "farmer@gmail.com", role: "Farmer", status: "Active" },
//     { id: 2, name: "Flynn Roger", email: "buyer@gmail.com", role: "Farmer", status: "Active" },
//     { id: 3, name: "Maria Lopez", email: "farmer@gmail.com", role: "Farmer", status: "Active" },
//     { id: 4, name: "Flynn Roger", email: "buyer@gmail.com", role: "Farmer", status: "Active" },
//     { id: 5, name: "Flynn Roger", email: "buyer@gmail.com", role: "Farmer", status: "Active" },
//   ];

//   return (
//     <div className="w-full">
//       {/* Profile Card */}
//       <div className="mt-10 ml-0 w-full rounded-2xl border border-gray-300 bg-white px-10 pt-8 pb-10 shadow-lg">
//         <div className="flex items-center gap-6">
//           {user.avatarUrl ? (
//             <img src={user.avatarUrl} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
//           ) : (
//             <FaUserCircle className="h-24 w-24 text-gray-400" />
//           )}
//           <div>
//             <p className="text-2xl font-semibold text-primaryYellow">
//               {user.name || "Admin FullName"}
//             </p>
//             <p className="text-base text-gray-500">{user.username ? `@${user.username}` : "@username"}</p>
//           </div>
//         </div>

//         <div className="mt-8 space-y-8">
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             <div className="flex flex-col gap-2">
//               <label htmlFor="email" className={labelCls}>E-mail</label>
//               <input id="email" type="text" value={notProvided(user.email)} readOnly className={inputCls} />
//             </div>

//             <div className="flex flex-col gap-2">
//               <label htmlFor="sex" className={labelCls}>Sex</label>
//               <input id="sex" type="text" value={notProvided(user.sex)} readOnly className={inputCls} />
//             </div>

//             <div className="flex flex-col gap-2">
//               <label htmlFor="phone" className={labelCls}>Phone Number</label>
//               <input id="phone" type="text" value={notProvided(user.phone)} readOnly className={inputCls} />
//             </div>
//           </div>

//           <div className="flex flex-col gap-2">
//             <label htmlFor="address" className={labelCls}>Address</label>
//             <textarea
//               id="address"
//               rows={1}
//               value={notProvided(user.address)}
//               readOnly
//               className={`${inputCls} resize-none`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Section title */}
//       <h2 className="mt-8 mb-3 text-2xl font-semibold text-primaryYellow">
//         List of Famers Under Admin
//       </h2>

//       {/* Table (no Actions column) */}
//       <div className="w-full overflow-x-auto rounded-xl border border-gray-300 bg-white shadow-lg">
//         {/* Header */}
//         <div className="flex items-center rounded-t-2xl bg-primaryYellow px-6 py-4 text-sm font-semibold text-black">
//           <div className="w-10">
//             <input type="checkbox" className="h-4 w-4 accent-black/80" aria-label="select-all" />
//           </div>
//           <div className="flex-1">Full Name</div>
//           <div className="flex-1">Email</div>
//           <div className="w-32">Role</div>
//           <div className="w-28">Status</div>
//         </div>

//         {/* Rows */}
//         <div className="divide-y divide-gray-100">
//           {rows.map((r) => (
//             <div key={r.id} className="flex items-center px-6 py-4 text-sm">
//               <div className="w-10">
//                 <input type="checkbox" className="h-4 w-4 accent-primaryYellow" />
//               </div>
//               <div className="flex-1 text-gray-700">{r.name}</div>
//               <div className="flex-1 text-gray-700">{r.email}</div>
//               <div className="w-32 text-gray-700">{r.role}</div>
//               <div className="w-28 text-gray-700">{r.status}</div>
//             </div>
//           ))}
//         </div>

//         {/* Footer controls */}
//         <div className="flex items-center justify-between px-6 py-4">
//           <div className="flex items-center gap-2 text-xs text-gray-500">
//             <div className="relative">
//               <select
//                 className="appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-gray-700"
//                 defaultValue="1"
//               >
//                 <option>1</option>
//                 <option>5</option>
//                 <option>10</option>
//               </select>
//               <IoChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500" />
//             </div>
//             <span>Displaying 4 out of 4</span>
//           </div>

//           <div className="flex items-center gap-3">
//             <button className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
//               Previous
//             </button>
//             <button className="rounded-lg bg-yellow-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-yellow-300">
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Back button */}
//       <div className="mt-8 flex justify-end">
//         <button
//           onClick={() => navigate("/super-admin/users")}
//           className="rounded-xl bg-primaryYellow px-12 py-2 text-md font-bold text-white shadow-sm hover:opacity-90"
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ViewAdmin;


import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
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

  // mock table data
  const rows = [
    { id: 1, name: "Maria Lopez", email: "farmer@gmail.com", role: "Farmer", status: "Active" },
    { id: 2, name: "Flynn Roger", email: "buyer@gmail.com", role: "Farmer", status: "Active" },
    { id: 3, name: "Maria Lopez", email: "farmer@gmail.com", role: "Farmer", status: "Active" },
    { id: 4, name: "Flynn Roger", email: "buyer@gmail.com", role: "Farmer", status: "Active" },
    { id: 5, name: "Flynn Roger", email: "buyer@gmail.com", role: "Farmer", status: "Active" },
  ];

  return (
    <div className="w-full">
      {/* Profile Card */}
      <div className="mt-10 ml-0 w-full rounded-2xl border border-gray-300 bg-white px-10 pt-8 pb-10 shadow-lg">
        <div className="flex items-center gap-6">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <FaUserCircle className="h-24 w-24 text-gray-400" />
          )}
          <div>
            <p className="text-2xl font-semibold text-primaryYellow">
              {user.name || "Admin FullName"}
            </p>
            <p className="text-base text-gray-500">{user.username ? `@${user.username}` : "@username"}</p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={labelCls}>E-mail</label>
              <input id="email" type="text" value={notProvided(user.email)} readOnly className={inputCls} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="sex" className={labelCls}>Sex</label>
              <input id="sex" type="text" value={notProvided(user.sex)} readOnly className={inputCls} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className={labelCls}>Phone Number</label>
              <input id="phone" type="text" value={notProvided(user.phone)} readOnly className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="address" className={labelCls}>Address</label>
            <textarea
              id="address"
              rows={1}
              value={notProvided(user.address)}
              readOnly
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Section title */}
      <h2 className="mt-8 mb-3 text-2xl font-semibold text-primaryYellow">
        List of Famers Under Admin
      </h2>

      {/* Table (smaller radius + smaller text) */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center rounded-t-lg pl-19 bg-primaryYellow px-5 py-3 text-[16px] font-semibold text-black">
          {/* <div className="w-10">
            <input type="checkbox" className="h-4 w-4 accent-black/80" aria-label="select-all" />
          </div> */}
          <div className="flex-1 ">Full Name</div>
          <div className="flex-1">Email</div>
          <div className="w-32">Role</div>
          <div className="w-28">Status</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center pl-18 px-5 py-3 text-[16px]">
              {/* <div className="w-10">
                <input type="checkbox" className="h-4 w-4 accent-primaryYellow" />
              </div> */}
              <div className="flex-1 text-gray-700">{r.name}</div>
              <div className="flex-1 text-gray-700">{r.email}</div>
              <div className="w-32 text-gray-700">{r.role}</div>
              <div className="w-28 text-gray-700">{r.status}</div>
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <div className="relative">
              <select
                className="appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-6 py-1.5 text-[12px] text-gray-700"
                defaultValue="1"
              >
                <option>1</option>
                <option>5</option>
                <option>10</option>
              </select>
              <IoChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <span>Displaying 4 out of 4</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="rounded-md bg-yellow-200 px-3.5 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-yellow-300">
              Next
            </button>
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
