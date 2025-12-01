// src/services/Messages.js
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

  // Sort threads: newest activity first (descending by last_time)
  const threads = (data || []).sort((a, b) => {
    const ta = a.last_time ? new Date(a.last_time).getTime() : 0;
    const tb = b.last_time ? new Date(b.last_time).getTime() : 0;
    return tb - ta;
  });

  return {
    userId,
    threads,
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

  // Ensure ascending order by created_at so newest is at bottom
  return (data || []).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

/* -------------------------------------------------------------
   REALTIME SUBSCRIPTION FOR A THREAD
------------------------------------------------------------- */
export function subscribeToThreadMessages(threadId, callback) {
  if (!threadId) return () => {};

  const channel = supabase
    .channel(`thread-messages-${threadId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "message", // ← make sure your table is named `message`
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        const row = payload.new;
        callback?.({
          message_id: row.message_id,
          thread_id: row.thread_id,
          sender_id: row.sender_id,
          body: row.body,
          file_url: row.file_url,
          is_read: row.is_read,
          created_at: row.created_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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
  return data?.[0] || null; // RPC returns rows from message_thread
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
