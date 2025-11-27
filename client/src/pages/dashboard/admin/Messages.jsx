// pages/admin/messages/Messages.jsx
import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { VscSend } from "react-icons/vsc";
import { GiPaperClip } from "react-icons/gi";

import {
  getMyThreads,
  getMessagesForThread,
  markThreadRead,
  sendChatMessage,
  startThreadWith,
  listFarmerRecipients,
  listBuyerRecipients,
} from "@/services/Messages";

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Messages() {
  const [myUserId, setMyUserId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState(null);

  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [newMessage, setNewMessage] = useState("");

  // recipient modals
  const [openFarmerModal, setOpenFarmerModal] = useState(false);
  const [openBuyerModal, setOpenBuyerModal] = useState(false);
  const [farmerList, setFarmerList] = useState([]);
  const [buyerList, setBuyerList] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Load threads on mount                                                 */
  /* ---------------------------------------------------------------------- */
  async function reloadThreads(selectFirst = false) {
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const { userId, threads } = await getMyThreads();
      setMyUserId(userId);
      setThreads(threads || []);

      if (selectFirst && threads.length > 0) {
        const firstId = threads[0].thread_id;
        setActiveThreadId(firstId);
        await loadMessages(firstId);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
      setThreadsError(err.message || "Failed to load conversations.");
    } finally {
      setThreadsLoading(false);
    }
  }

  useEffect(() => {
    reloadThreads(true);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Load messages for a thread                                            */
  /* ---------------------------------------------------------------------- */
  async function loadMessages(threadId) {
    if (!threadId) return;
    setMessagesLoading(true);
    try {
      const rows = await getMessagesForThread(threadId);
      setMessages(rows || []);
      await markThreadRead(threadId);
      // refresh threads so unread_count updates
      reloadThreads(false);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Send message                                                           */
  /* ---------------------------------------------------------------------- */
  async function handleSend() {
    const text = newMessage.trim();
    if (!text || !activeThreadId) return;

    try {
      // optimistic local append
      const temp = {
        message_id: `temp-${Date.now()}`,
        sender_id: myUserId,
        body: text,
        is_read: true,
        created_at: new Date().toISOString(),
        file_url: null,
      };
      setMessages((prev) => [...prev, temp]);
      setNewMessage("");

      await sendChatMessage({
        threadId: activeThreadId,
        body: text,
      });

      // reload to get canonical order / ids
      await loadMessages(activeThreadId);
    } catch (err) {
      console.error("Send message failed:", err);
      alert(err.message || "Failed to send message.");
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Open farmer / buyer modal                                             */
  /* ---------------------------------------------------------------------- */
  async function openFarmerPicker() {
    setOpenFarmerModal(true);
    if (farmerList.length) return; // already loaded

    setRecipientsLoading(true);
    try {
      const rows = await listFarmerRecipients();
      // map to simple shape for UI
      const mapped = (rows || []).map((r) => ({
        userId: r.user_id,
        name: r.full_name || r.email || "Farmer",
        email: r.email || "",
        role: r.role_name,
      }));
      setFarmerList(mapped);
    } catch (err) {
      console.error("Failed to load farmers:", err);
      alert(err.message || "Failed to load farmers.");
    } finally {
      setRecipientsLoading(false);
    }
  }

  async function openBuyerPicker() {
    setOpenBuyerModal(true);
    if (buyerList.length) return; // already loaded

    setRecipientsLoading(true);
    try {
      const rows = await listBuyerRecipients();
      const mapped = (rows || []).map((r) => ({
        userId: r.user_id,
        name: r.full_name || r.email || "Buyer",
        email: r.email || "",
        role: r.role_name,
      }));
      setBuyerList(mapped);
    } catch (err) {
      console.error("Failed to load buyers:", err);
      alert(err.message || "Failed to load buyers.");
    } finally {
      setRecipientsLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* When you click a farmer/buyer in modal                                */
  /* ---------------------------------------------------------------------- */
  async function handlePickRecipient(recipient) {
    try {
      const thread = await startThreadWith(recipient.userId);
      if (!thread) {
        alert("Failed to start conversation.");
        return;
      }

      // reload threads and set this as active
      await reloadThreads(false);

      const id = thread.thread_id;
      setActiveThreadId(id);
      await loadMessages(id);

      setOpenFarmerModal(false);
      setOpenBuyerModal(false);
    } catch (err) {
      console.error("Failed to start thread:", err);
      alert(err.message || "Failed to start conversation.");
    }
  }

  const activeThread =
    threads.find((t) => t.thread_id === activeThreadId) || null;

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex h-screen bg-gray-100 gap-2">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-white overflow-y-auto p-6 rounded-lg border border-gray-200 shadow-lg flex flex-col gap-4">
        {/* Top buttons: Message Farmer / Buyer */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={openFarmerPicker}
            className="flex-1 bg-primaryYellow text-white text-sm font-semibold rounded-lg px-3 py-2 hover:opacity-90"
          >
            Message Farmer
          </button>
          <button
            onClick={openBuyerPicker}
            className="flex-1 bg-yellow-200 text-primaryYellow text-sm font-semibold rounded-lg px-3 py-2 hover:bg-yellow-300"
          >
            Message Buyer
          </button>
        </div>

        {threadsLoading && (
          <p className="text-sm text-gray-500">Loading conversations…</p>
        )}
        {threadsError && (
          <p className="text-sm text-red-600">{threadsError}</p>
        )}
        {!threadsLoading && !threadsError && threads.length === 0 && (
          <p className="text-sm text-gray-400">
            No conversations yet. Start one by messaging a farmer or buyer.
          </p>
        )}

        {!threadsLoading &&
          !threadsError &&
          threads.map((conv) => {
            const active = conv.thread_id === activeThreadId;
            const last = conv.last_message || "";
            const unread = Number(conv.unread_count || 0) > 0;

            return (
              <div
                key={conv.thread_id}
                onClick={async () => {
                  setActiveThreadId(conv.thread_id);
                  await loadMessages(conv.thread_id);
                }}
                className={`flex items-center mb-3 cursor-pointer p-2 rounded-lg transition ${
                  active ? "bg-yellow-100" : "hover:bg-gray-100"
                }`}
              >
                <FaUserCircle className="w-10 h-10 rounded-full mr-3 text-gray-400" />
                <div className="flex-1">
                  <p className="font-bold text-base text-primaryYellow">
                    {conv.partner_name || "Conversation"}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-40">
                    {last}
                  </p>
                </div>
                {unread && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primaryYellow text-white text-xs">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            );
          })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 drop-shadow-custom border-b bg-white rounded-tr-lg rounded-tl-lg border border-gray-200">
          <FaUserCircle className="w-10 h-10 rounded-full mr-3 text-gray-400" />
          <div>
            <p className="font-semibold text-lg">
              {activeThread?.partner_name || "Select a conversation"}
            </p>
            {activeThread ? (
              <p className="text-xs text-gray-500">
                Last message:{" "}
                {activeThread.last_time
                  ? formatDateTime(activeThread.last_time)
                  : "—"}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Choose a thread on the left or start a new message.
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-yellow-50">
          {messagesLoading && (
            <p className="text-sm text-gray-500">Loading messages…</p>
          )}
          {!messagesLoading && !activeThread && (
            <p className="text-sm text-gray-400">
              No conversation selected yet.
            </p>
          )}
          {!messagesLoading &&
            activeThread &&
            messages.map((msg) => {
              const mine = msg.sender_id === myUserId;
              return (
                <div
                  key={msg.message_id}
                  className={`flex items-center gap-3 ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                >
                  {!mine && (
                    <FaUserCircle className="w-10 h-10 rounded-full mr-3 text-gray-400" />
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs ${
                      mine
                        ? "bg-yellow-400 text-black rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.body}</p>
                    <span className="text-[10px] text-gray-600 block mt-1 text-right">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  {mine && (
                    <FaUserCircle className="w-10 h-10 rounded-full mr-3 text-gray-400" />
                  )}
                </div>
              );
            })}
        </div>

        {/* Input */}
        <div className="p-4 drop-shadow-custom flex items-center justify-between bg-white rounded-br-lg rounded-bl-lg border border-gray-200">
          <GiPaperClip className="text-2xl text-gray-400 cursor-pointer" />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              activeThread ? "Type your message" : "Select a conversation first"
            }
            className="flex-1 rounded-full px-4 py-2 outline-none mx-3 bg-gray-100 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!activeThread}
          />
          <VscSend
            onClick={handleSend}
            className={`text-3xl cursor-pointer ${
              activeThread
                ? "text-primaryYellow"
                : "text-gray-300 cursor-not-allowed"
            }`}
          />
        </div>
      </div>

      {/* Farmer / Buyer selection modal */}
      {(openFarmerModal || openBuyerModal) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-lg text-gray-700">
                {openFarmerModal ? "Message Farmer" : "Message Buyer"}
              </h2>
              <button
                onClick={() => {
                  setOpenFarmerModal(false);
                  setOpenBuyerModal(false);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {recipientsLoading && (
                <p className="text-sm text-gray-500">Loading recipients…</p>
              )}

              {!recipientsLoading &&
                (openFarmerModal ? farmerList : buyerList).map((r) => (
                  <button
                    key={r.userId}
                    onClick={() => handlePickRecipient(r)}
                    className="w-full text-left px-4 py-3 border rounded-lg hover:bg-yellow-50 flex flex-col"
                  >
                    <span className="font-semibold text-sm text-gray-800">
                      {r.name}
                    </span>
                    <span className="text-xs text-gray-500">{r.email}</span>
                  </button>
                ))}

              {!recipientsLoading &&
                (openFarmerModal ? farmerList : buyerList).length === 0 && (
                  <p className="text-sm text-gray-400">
                    No recipients found for this role.
                  </p>
                )}
            </div>

            <div className="border-t px-4 py-3 flex justify-end">
              <button
                onClick={() => {
                  setOpenFarmerModal(false);
                  setOpenBuyerModal(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
