import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  MdSend,
  MdSearch,
  MdMoreVert,
  MdArrowBack,
  MdChatBubbleOutline,
} from "react-icons/md";
import axiosSecure from "./components/utils/axiosSecure";
import useChatSocket from "./components/hooks/useChatSocket.jsx";
import "./chatPage.css";

export default function ChatPage() {
  const { roomId } = useParams();
  const { theme, data: user } = useSelector((state) => state.user);
  const isDark = theme === "dark";

  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const token = localStorage.getItem("access_token");

  /* ---------------- helpers ---------------- */
  const getOtherParticipant = (room) => {
    if (!room || !user) return null;
    if (room.user?.id === user.id) return room.expert;
    if (room.expert?.id === user.id) return room.user;
    return null;
  };

  const otherUser = getOtherParticipant(selectedRoom);
  const text = isDark ? "text-white" : "text-black";

  /* ---------------- websocket ---------------- */
  const { send: sendWS, isReady } = useChatSocket({
    roomId: selectedRoom?.id,
    token,
    onMessage: (msg) => {
      setMessages((prev) => {
        // 1. Identify if it's my message (echo from server)
        // Check both username and ID if available to be safe
        const isMe = msg.sender === user?.username || msg.sender_id === user?.id;
        const incomingMsg = { ...msg, is_mine: isMe };

        // 2. Deduplication logic

        // If it's my message, look for an optimistic placeholder to replace
        if (isMe) {
          // Find optimistic message (is_mine=true, giant ID, matching text)
          const optimisticIndex = prev.findIndex(
            (m) => m.is_mine && m.text === incomingMsg.text && String(m.id).length > 10 // timestamp ID is long
          );

          if (optimisticIndex !== -1) {
            const newMsgs = [...prev];
            newMsgs[optimisticIndex] = incomingMsg; // Replace with confirmed message
            return newMsgs;
          }
        }

        // General deduplication by ID (if we already have this exact message ID)
        if (msg.id && prev.some((m) => m.id === msg.id)) {
          return prev;
        }

        return [...prev, incomingMsg];
      });
    },
    onTyping: (data) => {
      // Ignore my own typing events
      if (data.user === user?.username) return;

      setTypingUser(data.is_typing ? data.user : null);
    },

    onUserStatus: (data) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [data.user_id]: data.online,
      }));
    },
  });


  const isUserOnline = (userId) => {
    // If socket is connected to this room, assume online
    if (isReady) return true;

    // Fallback to backend status
    return onlineUsers[userId] ?? false;
  };


  /* ---------------- effects ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  // Mark messages as read
  useEffect(() => {
    if (!isReady) return;
    messages.forEach((msg) => {
      if (!msg.is_mine && msg.id) {
        sendWS({
          type: "message_read",
          message_id: msg.id,
        });
      }
    });
  }, [messages, isReady]);

  /* ---------------- api ---------------- */
  const fetchChatRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await axiosSecure.get("/v1/chat/rooms/");
      // const rooms = Array.isArray(res.data) ? res.data : [];
      setChatRooms(res.data || []);

      if (res.data?.length) {
        const room =
          res.data.find((r) => String(r.id) === roomId) || res.data[0];
        setSelectedRoom(room);
        fetchMessages(room.id);
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      setLoadingMessages(true);
      const res = await axiosSecure.get(`/v1/chat/rooms/${id}/messages/`);
      setMessages(res.data || []);
    } finally {
      setLoadingMessages(false);
    }
  };

  /* ---------------- actions ---------------- */
  const handleTyping = (value) => {
    setNewMessage(value);
    if (!isReady) return;

    sendWS({ type: "typing", is_typing: true });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      sendWS({ type: "typing", is_typing: false });
    }, 800);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom || !isReady) return;

    // Optimistic update
    const optimistic = {
      id: Date.now(),
      text: newMessage,
      is_mine: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    sendWS({
      type: "chat_message",
      text: newMessage,
    });

    setNewMessage("");
    // Also clear typing immediately
    sendWS({ type: "typing", is_typing: false });
  };

  const filteredRooms = chatRooms.filter((room) => {
    const other = getOtherParticipant(room);
    const name = `${other?.first_name || ""} ${other?.last_name || ""}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  function TypingDots() {
    return (
      <span className="flex gap-1">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
    );
  }


  /* ============================ UI ============================ */

  return (
    <div className={`flex h-[calc(100vh-152px)] md:h-[calc(100vh-96px)] overflow-hidden max-w-7xl mx-auto w-full ${isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]"}`}>
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`w-full md:w-80 lg:w-[400px] flex flex-col border-r transition-all duration-500 ${isDark ? "border-white/5 bg-[#0a0a0a]" : "border-black/5 bg-white"
        } ${selectedRoom && "hidden md:flex"}`}>
        <div className="p-8 pb-6">
          <h2 className={`text-3xl font-black tracking-tighter mb-6 ${text}`}>Intel <span className="text-red-600">Feed</span></h2>
          <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 border transition-all ${isDark ? "bg-white/5 border-white/5 focus-within:border-red-500/50" : "bg-neutral-100 border-black/5 focus-within:border-red-500/50"
            }`}>
            <MdSearch size={20} className="opacity-30" />
            <input
              className={`bg-transparent outline-none w-full text-sm font-bold placeholder:opacity-40 placeholder:font-bold ${text}`}
              placeholder="FILTER DISPATCHES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
          {loadingRooms ? (
            // SKELETON LOADER
            [1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-4 p-4 rounded-2xl animate-pulse">
                <div className={`h-14 w-14 rounded-2xl ${isDark ? "bg-white/5" : "bg-neutral-200"}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-24 rounded ${isDark ? "bg-white/5" : "bg-neutral-200"}`} />
                  <div className={`h-3 w-32 rounded ${isDark ? "bg-white/5" : "bg-neutral-200"}`} />
                </div>
              </div>
            ))
          ) : filteredRooms.length === 0 ? (
            <div className="py-20 text-center opacity-20">
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No frequency found</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const other = getOtherParticipant(room);
              const isActive = selectedRoom?.id === room.id;
              // Check online status if we have the user ID
              // (Assuming `other` has an `id` field)
              const isOnline = other?.id && onlineUsers[other.id];

              return (
                <div
                  key={room.id}
                  onClick={() => { setSelectedRoom(room); fetchMessages(room.id); }}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${isActive
                    ? "bg-red-600 text-white shadow-xl shadow-red-600/20 translate-x-1"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                >
                  <div className={`relative h-14 w-14 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-105 ${!isActive && "border border-black/5 dark:border-white/5"}`}>
                    <img
                      src={other?.profile_picture || `https://ui-avatars.com/api/?name=${other?.first_name}&background=random`}
                      className="w-full h-full object-cover"
                    />
                    {/* ONLINE DOT ON AVATAR */}
                    {isOnline && (
                      <div className="absolute bottom-1 right-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-black" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black text-sm truncate leading-none mb-1.5 ${isActive ? "text-white" : text}`}>
                      {other?.first_name} {other?.last_name}
                    </h4>
                    <p className={`text-[11px] truncate font-medium ${isActive ? "text-white/70" : "opacity-40"}`}>
                      {typeof room.last_message === "object"
                        ? room.last_message.text
                        : room.last_message || "Awaiting transmission..."}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ================= CHAT WINDOW ================= */}
      <main className={`flex-1 flex flex-col ${!selectedRoom && "hidden md:flex"} animate-fadeIn`}>
        {selectedRoom ? (
          <>
            {/* HEADER */}
            <header className={`flex items-center justify-between px-8 py-6 border-b z-10 ${isDark ? "bg-[#0a0a0a]/80 border-white/5" : "bg-white/80 border-black/5"
              } backdrop-blur-xl`}>
              <div className="flex items-center gap-4">
                <button className="md:hidden text-red-600" onClick={() => setSelectedRoom(null)}>
                  <MdArrowBack size={24} />
                </button>

                <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-xl border-2 border-red-500/20">
                  <img src={otherUser?.profile_picture || `https://ui-avatars.com/api/?name=${otherUser?.first_name}`} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h3 className={`font-black text-base tracking-tight ${text}`}>
                    {otherUser?.first_name} {otherUser?.last_name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shadow-sm ${isUserOnline(otherUser?.id) ? "bg-green-500 animate-pulse shadow-green-500/50" : "bg-neutral-500"}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">
                      {isUserOnline(otherUser?.id) ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <button className={`h-11 w-11 flex items-center justify-center rounded-xl border border-black/5 dark:border-white/5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all group ${text}`}>
                <MdMoreVert size={20} className="opacity-40 group-hover:opacity-100" />
              </button>
            </header>




            {/* MESSAGES */}
            <div className={`flex-1 overflow-y-auto p-8 space-y-6 ${isDark ? "bg-[#0d0d0d]" : "bg-neutral-50"}`}>
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Decoding Frequency...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20">
                  <MdChatBubbleOutline size={64} className="mb-4" />
                  <p className="font-black text-sm uppercase tracking-widest leading-none">Initialize Stream</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.is_mine;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`group relative px-6 py-4 rounded-3xl text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-lg max-w-[75%] sm:max-w-[70%] break-words whitespace-pre-wrap break-all border ${isMine
                        ? "bg-red-600 text-white border-red-500 rounded-tr-[4px]"
                        : isDark
                          ? "bg-white/5 text-white border-white/5 rounded-tl-[4px]"
                          : "bg-white text-black border-black/5 rounded-tl-[4px]"
                        }`}>
                        {msg.file ? (
                          <a href={msg.file} target="_blank" rel="noreferrer" className="underline font-bold">
                            📎 Encrypted Attachment
                          </a>
                        ) : (
                          msg.text
                        )}
                        <span className={`absolute -bottom-5 right-0 text-[9px] font-black uppercase opacity-0 group-hover:opacity-30 transition-opacity tracking-tighter ${text}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>


            {/* TYPING INDICATOR */}
            {typingUser && (
              <div className={`px-8 py-2 text-xs font-medium flex items-center gap-2 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                <span>{typingUser} is typing</span>
                <TypingDots />
              </div>
            )}
            {/* INPUT AREA */}
            <div className={`p-8 border-t ${isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-black/5"}`}>
              <div className={`flex items-center gap-4 rounded-3xl px-6 py-4 border transition-all ${isDark ? "bg-white/5 border-white/5 focus-within:border-red-500/50" : "bg-neutral-50 border-black/5 focus-within:border-red-500/50"
                }`}>
                <input
                  className={`flex-1 bg-transparent outline-none text-sm font-bold placeholder:opacity-30 ${text}`}
                  placeholder="TRANSMIT INTELLIGENCE..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`h-12 w-12 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-300 ${newMessage.trim()
                    ? "bg-red-600 text-white shadow-red-600/30 hover:scale-110 active:scale-95 translate-x-2"
                    : "bg-neutral-100 dark:bg-white/5 text-neutral-400 cursor-not-allowed"
                    }`}
                >
                  <MdSend size={24} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
            <div className="h-32 w-32 bg-black/5 dark:bg-white/5 rounded-[40px] flex items-center justify-center text-red-600 mb-8 shadow-inner">
              <MdChatBubbleOutline size={64} className="opacity-40" />
            </div>
            <h2 className={`text-2xl font-black tracking-tighter mb-2 ${text}`}>QKICS <span className="text-red-600">Secure Comm</span></h2>
            <p className="opacity-30 font-bold uppercase text-[10px] tracking-[0.4em]">Establish valid connection to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}
