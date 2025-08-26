import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { VscSend } from "react-icons/vsc";
import { GiPaperClip } from "react-icons/gi";

export default function Messages() {
  // Dummy conversations
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Buyer A. Name",
      avatar: "https://placekitten.com/50/50",
      online: true,
      messages: [
        {
          id: 1,
          sender: "other",
          text: "Hello I have a question regarding chuhuuc",
          time: "12:00 PM",
        },
        {
          id: 2,
          sender: "me",
          text: "So what kabayong budlat",
          time: "12:01 PM",
        },
        {
          id: 3,
          sender: "other",
          text: "Bruh, don't ignore my question 😂",
          time: "12:02 PM",
        },
        {
          id: 4,
          sender: "me",
          text: "HAHA sorry, what's up?",
          time: "12:03 PM",
        },
      ],
    },
    {
      id: 2,
      name: "Buyer B. Name",
      avatar: "https://placekitten.com/51/51",
      online: false,
      messages: [
        {
          id: 1,
          sender: "other",
          text: "Is this still available?",
          time: "9:30 AM",
        },
        { id: 2, sender: "me", text: "Yes it is 👍", time: "9:31 AM" },
      ],
    },
  ]);

  // Active conversation state
  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const updatedConv = {
      ...activeConv,
      messages: [
        ...activeConv.messages,
        {
          id: activeConv.messages.length + 1,
          sender: "me",
          text: newMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    setConversations((prev) =>
      prev.map((conv) => (conv.id === activeConv.id ? updatedConv : conv))
    );

    setActiveConv(updatedConv);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100 gap-2">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-white overflow-y-auto p-6 rounded-lg border border-gray-200 shadow-lg">
        {conversations.map((conv) => {
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <div
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`flex items-center mb-4 cursor-pointer p-2 rounded-lg ${
                activeConv.id === conv.id
                  ? "bg-yellow-100"
                  : "hover:bg-gray-100"
              }`}
            >
              <FaUserCircle className="w-10 h-10 rounded-full mr-3" />
              {/* <img src={conv.avatar} alt="avatar" className="w-10 h-10 rounded-full mr-3" /> */}
              <div>
                <p className="font-bold text-lg text-primaryYellow">
                  {conv.name}
                </p>
                <p className="text-base text-gray-400 truncate w-40">
                  {lastMsg.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 drop-shadow-custom border-b bg-white rounded-tr-lg rounded-tl-lg border border-gray-200">
          <FaUserCircle className="w-10 h-10 rounded-full mr-3" />
          {/* <img src={activeConv.avatar} alt="avatar" className="w-10 h-10 rounded-full" /> */}
          <div>
            <p className="font-semibold text-lg">{activeConv.name}</p>
            <p
              className={`text-base ${
                activeConv.online ? "text-yellow-500" : "text-gray-500"
              }`}
            >
              {activeConv.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-yellow-50">
          {activeConv.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-center gap-3 ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
                {msg.sender != "me" && <FaUserCircle className="w-10 h-10 rounded-full mr-3" />}
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  msg.sender === "me"
                    ? "bg-yellow-400 text-black rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs text-gray-600 block mt-1">
                  {msg.time}
                </span>
              </div>
                {msg.sender === "me" && <FaUserCircle className="w-10 h-10 rounded-full mr-3" />}

            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 drop-shadow-custom flex items-center justify-between bg-white rounded-br-lg rounded-bl-lg">
          <GiPaperClip className="text-2xl text-gray-400 cursor-pointer" />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
            className="flex-1 rounded-full px-4 py-2 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <VscSend
            onClick={handleSend}
            className="text-3xl text-primaryYellow cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
