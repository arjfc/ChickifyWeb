// import React from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { useLocation, useNavigate } from "react-router-dom";

// export default function EditAdmin() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = location.state || {};

//   if (!user) return <p>No user data provided</p>;

//   return (
//     <div className="w-full">
//       <div className="mt-10 ml-0 w-full max-w-8xl rounded-2xl border border-gray-300 bg-white px-12 pt-10 pb-12 shadow-lg">
//         {/* Profile Image + Name */}
//         <div className="flex items-center gap-4">
//           <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
//           <div className="flex-1">
//             <label className="block text-sm font-semibold text-gray-400">
//               Full Name
//             </label>
//             <input
//               type="text"
//               defaultValue={`${user.firstName || ""} ${user.lastName || ""}`}
//               className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//         </div>

//         {/* Form */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Row 1: First + Last Name */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-400">
//               First Name
//             </label>
//             <input
//               type="text"
//               defaultValue={user.firstName || ""}
//               className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-400">
//               Last Name
//             </label>
//             <input
//               type="text"
//               defaultValue={user.lastName || ""}
//               className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>

//           {/* Row 2: Middle Name + Sex + Phone */}
//           <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-semibold text-gray-400">
//                 Middle Name (Optional)
//               </label>
//               <input
//                 type="text"
//                 defaultValue={user.middleName || ""}
//                 className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-400">
//                 Sex
//               </label>
//               <select
//                 defaultValue={user.sex || ""}
//                 className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               >
//                 <option value="">Select</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-gray-400">
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 defaultValue={user.phoneNumber || ""}
//                 className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>
//           </div>

//           {/* Row 3: Username + Email */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-400">
//               Username
//             </label>
//             <input
//               type="text"
//              defaultValue={user.email || ""}
//               className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-400">
//               Address
//             </label>
//             <input
//               type="text"
//               defaultValue={user.address || ""}
//               className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
//             />
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col sm:flex-row justify-end gap-4">
//           <button
//             className="w-full sm:w-auto mt-4 cursor-pointer text-base sm:text-md rounded-lg text-primaryYellow font-bold shadow-md bg-yellow-100 px-6 sm:px-8 py-2 sm:py-3 hover:bg-yellow-200"
//             onClick={() => navigate("/admin/users")}
//           >
//             Cancel
//           </button>
//           <button
//             className="w-full sm:w-auto mt-4 cursor-pointer text-base sm:text-md rounded-lg text-white font-bold shadow-md bg-primaryYellow px-6 sm:px-8 py-2 sm:py-3 hover:opacity-90"
//             onClick={() => navigate("/admin/users")}
//           >
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/admin/users/EditAdmin.jsx
import React, { useEffect, useState, useMemo } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import {
  fetchFarmerDetails,
  adminUpdateFarmerProfile,
} from "@/services/FarmerRequests";
import {
  municipalities,
  getLatLon,
  getZip,
} from "@/services/BantayanData";

export default function EditAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {}; // { email, name, id }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [province, setProvince] = useState("Cebu");

  if (!user) return <p>No user data provided</p>;

  const muniOptions = useMemo(
    () => municipalities.map((m) => m.name),
    []
  );

  const barangayOptions = useMemo(() => {
    const muni = municipalities.find((m) => m.name === city);
    return muni ? muni.barangays.map((b) => b.name) : [];
  }, [city]);

  const recomputeGeo = (cityName, barangayName) => {
    if (!cityName) {
      setLat(null);
      setLon(null);
      return;
    }
    const coords = getLatLon(cityName, barangayName || "");
    const zip = getZip(cityName);

    if (coords) {
      setLat(coords.lat);
      setLon(coords.lon);
    } else {
      setLat(null);
      setLon(null);
    }
    if (zip) setPostalCode(zip);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const details = await fetchFarmerDetails(user.id);
        if (!mounted || !details) return;

        setFirstName(details.firstName || "");
        setMiddleName(details.middleName || "");
        setLastName(details.lastName || "");
        setSex(details.sex || "");
        setPhoneNumber(details.phoneNumber || "");

        const ap = details.addressParts || {};
        setHouseNumber(ap.houseNumber || "");
        setStreet(ap.street || "");
        setBarangay(ap.barangay || "");
        setCity(ap.city || "");
        setProvince(ap.province || "Cebu");   // 👈 here
        setPostalCode(ap.postalCode || "");
        setDeliveryNotes(ap.deliveryNotes || "");
        setLat(ap.lat ?? null);
        setLon(ap.lon ?? null);
      } catch (e) {
        if (!mounted) return;
        console.error("Failed to load farmer details:", e);
        setError(e.message || "Failed to load farmer details.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  const displayFullName =
    `${firstName || ""} ${middleName || ""} ${lastName || ""}`.trim() ||
    user.name ||
    "";

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    setBarangay("");
    recomputeGeo(newCity, "");
  };

  const handleBarangayChange = (e) => {
    const newBrgy = e.target.value;
    setBarangay(newBrgy);
    recomputeGeo(city, newBrgy);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const addressParts = {
        houseNumber,
        street,
        barangay,
        city,
        province,
        postalCode,
        deliveryNotes,
        lat,
        lon,
      };

      await adminUpdateFarmerProfile({
        id: user.id,
        firstName,
        middleName,
        lastName,
        sex,
        phoneNumber,
        addressParts,
      });

      alert("Farmer profile updated successfully.");
      navigate("/admin/users");
    } catch (e) {
      console.error("Failed to update farmer profile:", e);
      setError(e.message || "Failed to update farmer profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mt-10 ml-0 w-full max-w-8xl rounded-2xl border border-gray-300 bg-white px-12 pt-10 pb-12 shadow-lg">
        {error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        {/* Profile Image + Name */}
        <div className="flex items-center gap-4 mb-6">
          <FaUserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              value={displayFullName}
              readOnly
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading farmer details…</p>
        ) : (
          <>
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: First, Last, Middle Name (in that order) */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Middle Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Row 2: Sex + Phone */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                 <label className="block text-sm font-semibold text-gray-400">
                  E-mail
                </label>
                <input
                  type="text"
                  value={user.email || ""}
                  readOnly
                  className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
                />
                </div>
                {/* empty spacer to balance grid */}
                <div className="hidden md:block" />
            </div>

              {/* Row 4: House Number + Street */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    House Number
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Street
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Province
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              {/* Row 5: Province + City + Barangay */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    City / Municipality
                  </label>
                  <select
                    value={city}
                    onChange={handleCityChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select municipality</option>
                    {muniOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Barangay
                  </label>
                  <select
                    value={barangay}
                    onChange={handleBarangayChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    disabled={!city}
                  >
                    <option value="">Select barangay</option>
                    {barangayOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              {/* Lat / Lon kept in state but HIDDEN in UI */}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                className="w-full sm:w-auto mt-4 cursor-pointer text-base sm:text-md rounded-lg text-primaryYellow font-bold shadow-md bg-yellow-100 px-6 sm:px-8 py-2 sm:py-3 hover:bg-yellow-200"
                onClick={() => navigate("/admin/users")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto mt-4 cursor-pointer text-base sm:text-md rounded-lg text-white font-bold shadow-md bg-primaryYellow px-6 sm:px-8 py-2 sm:py-3 hover:opacity-90 disabled:opacity-70"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
