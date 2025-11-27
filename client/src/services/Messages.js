import { supabase } from "@/lib/supabase";
import { getMyUserProfile } from "@/services/Profile";

/* -------------------------------------------------------------
   Helper: Get logged-in user_id (uuid)
------------------------------------------------------------- */
async function getMyUserId() {
  const profile = await getMyUserProfile();
  if (!profile?.user_id) throw new Error("Missing user_id for current user.");
  return profile.user_id;
}

/* -------------------------------------------------------------
   THREAD LIST (sidebar)
------------------------------------------------------------- */
export async function getMyThreads() {
  const userId = await getMyUserId();

  const { data, error } = await supabase.rpc("get_threads_for_user", {
    p_user_id: userId,
  });

  if (error) throw error;

  return {
    userId,
    threads: data || [],
  };
}

/* -------------------------------------------------------------
   FETCH MESSAGES PER THREAD
------------------------------------------------------------- */
export async function getMessagesForThread(threadId) {
  const { data, error } = await supabase.rpc("get_messages", {
    p_thread_id: threadId,
  });

  if (error) throw error;
  return data || [];
}

/* -------------------------------------------------------------
   MARK THREAD AS READ
------------------------------------------------------------- */
export async function markThreadRead(threadId) {
  const userId = await getMyUserId();

  const { error } = await supabase.rpc("mark_thread_read", {
    p_thread_id: threadId,
    p_user_id: userId,
  });

  if (error) throw error;
}

/* -------------------------------------------------------------
   CREATE / GET THREAD WITH PARTNER
------------------------------------------------------------- */
export async function startThreadWith(partnerUserId) {
  const myId = await getMyUserId();

  const { data, error } = await supabase.rpc("start_message_thread", {
    p_sender_user_id: myId,
    p_receiver_user_id: partnerUserId,
  });

  if (error) throw error;
  return data?.[0] || null;   // will still work, RPC returns rows from message_thread
}


/* -------------------------------------------------------------
   SEND MESSAGE
------------------------------------------------------------- */
export async function sendChatMessage({ threadId, body, fileUrl = null }) {
  const userId = await getMyUserId();

  const { data, error } = await supabase.rpc("send_message", {
    p_thread_id: threadId,
    p_sender_user_id: userId,
    p_body: body,
    p_file_url: fileUrl,
  });

  if (error) throw error;
  return data; // message_id
}

/* -------------------------------------------------------------
   FETCH FARMERS
------------------------------------------------------------- */
export async function listFarmerRecipients() {
  const { data, error } = await supabase.rpc("list_farmer_recipients");
  if (error) throw error;
  return data || [];
}

/* -------------------------------------------------------------
   FETCH BUYERS
------------------------------------------------------------- */
export async function listBuyerRecipients() {
  const { data, error } = await supabase.rpc("list_buyer_recipients");
  if (error) throw error;
  return data || [];
}


