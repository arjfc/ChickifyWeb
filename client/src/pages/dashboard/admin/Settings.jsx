import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "@/lib/supabase"; // make sure this exists

const DEBOUNCE_MS = 800;

export default function Settings() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  // Demo LGU list (unchanged)
  const PH_LGU = {
    Cebu: {
      "Cebu City": ["Lahug", "Tisa", "Mabolo"],
      "Bantayan Island": ["Atop-Stop", "Baigad", "Baod"],
    },
    "Negros Occidental": {
      "Bacolod City": ["Mandalagan", "Tangub"],
    },
  };

  // ------- Form state (copy from user initially) -------
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [middleName, setMiddleName] = useState(user?.middleName || "");
  const [sex, setSex] = useState(user?.sex || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const [address, setAddress] = useState(user?.address || "");
  const [province, setProvince] = useState(user?.province || "");
  const [municipal, setMunicipal] =
    useState(user?.municipal || user?.municipality || "");
  const [barangay, setBarangay] = useState(user?.barangay || "");
  const [streetName, setStreetName] = useState(user?.streetName || "");
  const [houseNumber, setHouseNumber] = useState(user?.houseNumber || "");
  const [zipCode, setZipCode] = useState(user?.zipCode || "");
  const [latitude, setLatitude] = useState(user?.latitude ?? "");
  const [longitude, setLongitude] = useState(user?.longitude ?? "");

  // ---------- FETCH FULL COOP / USER PROFILE AND FILL FIELDS ----------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_my_profile_superadmin");
        console.log("get_my_profile_superadmin result:", data, error);

        if (error) throw error;
        if (!data || cancelled) return;

        // ✅ handle both array and single-object responses
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) return;

        setFirstName(row.first_name ?? "");
        setLastName(row.last_name ?? "");
        setMiddleName(row.middle_name ?? "");
        setSex(row.sex ?? "");
        setPhoneNumber(row.contact_no ?? "");
        setUsername(row.username ?? "");
        setEmail(row.email ?? "");

        setAddress(row.address ?? "");
        setProvince(row.province ?? "");
        setMunicipal(row.municipal ?? row.municipality ?? "");
        setBarangay(row.barangay ?? "");
        setStreetName(row.street_name ?? "");
        setHouseNumber(row.house_no ?? "");
        setZipCode(row.zip_code ?? "");

        setLatitude(
          row.latitude === null || row.latitude === undefined
            ? ""
            : String(row.latitude)
        );
        setLongitude(
          row.longitude === null || row.longitude === undefined
            ? ""
            : String(row.longitude)
        );
      } catch (err) {
        console.error("Failed to load coop/user profile:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------- Derived lists for selects -------
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

  // ------- Build a single full address string -------
  function buildFullAddress() {
    return [
      houseNumber && `#${houseNumber}`,
      streetName,
      address, // freeform line
      barangay,
      municipal,
      province,
      zipCode,
      "Philippines",
    ]
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .join(", ");
  }

  // ------- Debounced geocode on address changes -------
  const geocodeTimer = useRef(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const fullAddress = buildFullAddress();

  useEffect(() => {
    if (!isEditing) return; // only geocode while editing
    if (!fullAddress || fullAddress.length < 8) return;

    // Debounce
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        const q = encodeURIComponent(fullAddress);
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q=${q}`;

        const resp = await fetch(url, {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Chickify/1.0 (contact@example.com)",
          },
        });
        if (!resp.ok) throw new Error("Geocode failed");
        const json = await resp.json();

        if (json?.[0]?.lat && json?.[0]?.lon) {
          setLatitude(json[0].lat);
          setLongitude(json[0].lon);
        }
      } catch (err) {
        console.warn("Geocoding error:", err);
      } finally {
        setIsGeocoding(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditing,
    address,
    province,
    municipal,
    barangay,
    streetName,
    houseNumber,
    zipCode,
  ]);

  // ------- Save to Supabase via RPC -------
  async function onSave() {
    try {
      const { error } = await supabase.rpc("rpc_update_my_user_profile", {
        p_first_name: firstName,
        p_last_name: lastName,
        p_middle_name: middleName,
        p_sex: sex,
        p_contact_no: phoneNumber,
        p_username: username,
        p_email: email,
        p_address: address,
        p_province: province,
        p_municipal: municipal,
        p_barangay: barangay,
        p_street_name: streetName,
        p_house_no: houseNumber,
        p_zip_code: zipCode,
        p_latitude: latitude ? Number(latitude) : null,
        p_longitude: longitude ? Number(longitude) : null,
        p_full_address: fullAddress,
      });
      if (error) throw error;

      setIsEditing(false);
      alert("Profile saved successfully.");
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save profile");
    }
  }

  return (
    <div className="px-10 ml-1 py-6 rounded-lg border border-gray-200 shadow-lg mt-5 flex flex-col gap-5">
      <div className="flex flex-row gap-5 items-center">
        <FaUserCircle className="w-25 h-25" />
        <div className="flex gap-5 h-full items-end">
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="bg-primaryYellow text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
          <button
            onClick={() => alert("clicked")}
            className="bg-gray-500 text-white font-medium rounded-lg px-5 py-2 hover:opacity-90"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Middle / Sex / Phone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">
            Middle Name <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Sex</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Phone Number</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Username / Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Freeform Address */}
      <div className="flex flex-col gap-1">
        <label className="text-yellow-400 font-semibold">Address</label>
        <textarea
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 rounded-md border border-gray-300 resize-none disabled:bg-gray-100"
        />
      </div>

      {/* Address details */}
      <p className="text-base font-semibold text-gray-700">Address Details</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Province</label>
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setMunicipal("");
              setBarangay("");
            }}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
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
          <label className="text-yellow-400 font-semibold">Municipal</label>
          <select
            value={municipal}
            onChange={(e) => {
              setMunicipal(e.target.value);
              setBarangay("");
            }}
            disabled={!isEditing || !province}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
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
          <label className="text-yellow-400 font-semibold">Barangay</label>
          <select
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            disabled={!isEditing || !municipal}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
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

      {/* Street / House / Zip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">
            Street Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">
            House Number <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Zip Code</label>
          <input
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 rounded-md border border-gray-300 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Lat / Lng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Latitude</label>
          <input
            value={latitude}
            readOnly
            disabled
            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-yellow-400 font-semibold">Longitude</label>
          <input
            value={longitude}
            readOnly
            disabled
            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100"
          />
        </div>

        {/* Save button */}
        {isEditing && (
          <div className="flex items-end justify-end">
            <button
              onClick={onSave}
              disabled={isGeocoding}
              title={isGeocoding ? "Please wait for geocoding to finish…" : ""}
              className={`px-9 py-2 rounded-md text-white font-bold ${
                isGeocoding
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primaryYellow hover:opacity-90"
              }`}
            >
              {isGeocoding ? "Locating…" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
