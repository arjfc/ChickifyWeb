// services/trucking.js
import { supabase } from "@/lib/supabase";

export async function addTruckingProfileForAdmin(payload) {
  const {
    name,
    company_name,
    truck_number,
    phone_number,
    plate_number,
    is_active,
    weekly_schedule_days, // from the modal
  } = payload;

  const { data, error } = await supabase.rpc(
    "add_trucking_profile_with_schedule",
    {
      p_name: name,
      p_company_name: company_name,
      p_truck_number: truck_number,
      p_phone_number: phone_number || null,
      p_plate_number: plate_number,
      p_is_active: is_active,
      // 👇 THIS is the important part
      p_weekly_schedule: weekly_schedule_days || [],
    }
  );

  if (error) {
    console.error("createTruckingProfile error:", error);
    throw error;
  }

  // function returns the inserted row
  return data;
}


export function formatWeeklySchedule(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return "No schedule set";
  }

  return arr
    .map((d) => {
      const s = String(d || "").trim().toLowerCase();
      if (!s) return "";
      return s.charAt(0).toUpperCase() + s.slice(1); // monday -> Monday
    })
    .filter(Boolean)
    .join(", ");
}
/**
 * Fetch all drivers for the current admin.
 */
export async function fetchTruckingProfiles(includeInactive = true) {
  const { data, error } = await supabase.rpc(
    "get_trucking_profiles_for_admin",
    { p_include_inactive: includeInactive }
  );

  if (error) {
    console.error("get_trucking_profiles_for_admin error:", error);
    throw error;
  }

  const rows = data || [];

  // Normalize & add a preformatted label for the table
  return rows.map((row) => {
    const weekly = row.weekly_schedule || [];
    return {
      ...row,
      weekly_schedule: weekly,
      weekly_schedule_label: formatWeeklySchedule(weekly),
    };
  });
}