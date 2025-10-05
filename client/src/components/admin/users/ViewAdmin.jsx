import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function ViewAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  if (!user) return <p>No user data provided</p>;

  return (
    <div className="w-full">
      {/* Card */}
      <div className="mt-10 ml-0 w-full max-w-8xl rounded-2xl border border-gray-300 bg-white px-12 pt-10 pb-12 shadow-lg">
        {/* Header */}
        <div className="flex flex-row gap-3 items-center">
          <FaUserCircle className="w-16 h-16 text-gray-400" />
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-primaryYellow">
              {user.name}
            </p>
            <p className="text-sm text-gray-600">@{user.username}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {/* Row 1: Email, Sex, Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-400">
                E-mail
              </label>
              <input
                type="text"
                value={user.email}
                readOnly
                className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-400">
                Sex
              </label>
              <select
                defaultValue={user.sex || ""}
                className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white text-gray-600 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-400">
                Phone Number
              </label>
              <input
                type="tel"
                value={user.phoneNumber}
                readOnly
                className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Address + Farm Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-400">
                Address
              </label>
              <textarea
                rows={2}
                defaultValue={user.address}
                readOnly
                className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none resize-none"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-400">
                Farm Location
              </label>
              <textarea
                rows={2}
                defaultValue={user.farmLoc}
                readOnly
                className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex items-center justify-center">
        <button
          className="cursor-pointer text-base mt-5 sm:text-md rounded-lg text-white font-bold text-center bg-primaryYellow px-6 sm:px-10 py-2 sm:py-3 hover:opacity-90"
          onClick={() => navigate("/admin/users")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default ViewAdmin;


// import { FaUserCircle } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// function ViewAdmin() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = location.state || {};

//   if (!user) return <p>No user data provided</p>;

//   return (
//     <div className="flex flex-col gap-6 p-4 sm:p-6">
//       {/* Card */}
//       <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-6 sm:py-10 flex flex-col gap-6 rounded-lg border border-gray-200 shadow-lg bg-white">
        
//         {/* Header */}
//         <div className="flex flex-row gap-3 items-center">
//           <FaUserCircle className="w-16 h-16 text-gray-400" />
//           <div className="flex flex-col">
//             <p className="text-lg font-semibold text-primaryYellow">
//               {user.name}
//             </p>
//             <p className="text-sm text-gray-600">@{user.username}</p>
//           </div>
//         </div>

//         {/* Fields */}
//         <div className="space-y-6">
//           {/* Row 1: Email, Sex, Phone Number */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex flex-col gap-1">
//               <label className="block text-sm font-semibold text-gray-400">
//                 E-mail
//               </label>
//               <input
//                 type="text"
//                 value={user.email}
//                 readOnly
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
//               />
//             </div>
//             <div className="flex flex-col gap-1">
//               <label className="block text-sm font-semibold text-gray-400">
//                 Sex
//               </label>
//               <select
//                 defaultValue={user.sex || ""}
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-white text-gray-600 focus:outline-none"
//               >
//                 <option value="">Select</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//               </select>
//             </div>
//             <div className="flex flex-col gap-1">
//               <label className="block text-sm font-semibold text-gray-400">
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 value={user.phoneNumber}
//                 readOnly
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
//               />
//             </div>
//           </div>

//           {/* Row 2: Address + Farm Location */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="flex flex-col gap-1 md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-400">
//                 Address
//               </label>
//               <textarea
//                 rows={3}
//                 defaultValue={user.address}
//                 readOnly
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none resize-none"
//               />
//             </div>
//             <div className="flex flex-col gap-1 md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-400">
//                 Farm Location
//               </label>
//               <textarea
//                 rows={3}
//                 defaultValue={user.farmLoc}
//                 readOnly
//                 className="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none resize-none"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Back Button */}
//       <div className="flex items-center justify-center">
//         <button
//           className="cursor-pointer text-base sm:text-lg rounded-lg text-white font-bold text-center bg-primaryYellow px-6 sm:px-10 py-2 sm:py-3 hover:opacity-90"
//           onClick={() => navigate("/admin/users")}
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ViewAdmin;
