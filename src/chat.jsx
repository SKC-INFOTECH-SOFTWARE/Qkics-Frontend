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
import useThemeClasses from "./components/utils/useThemeClasses";

export default function ChatPage() {
  const { roomId } = useParams();
  const { theme, data: user } = useSelector((state) => state.user);
  const isDark = theme === "dark";
  const { bg, card, border, input } = useThemeClasses(isDark);

  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);

  /* --------------------------------
     HELPER: OTHER PARTICIPANT
  -------------------------------- */
  const getOtherParticipant = (room) => {
    if (!room || !user) return null;
    if (room.user?.id === user.id) return room.expert;
    if (room.expert?.id === user.id) return room.user;
    return null;
  };

  /* --------------------------------
     AUTO SCROLL
  -------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* --------------------------------
     FETCH CHAT ROOMS
  -------------------------------- */
  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const res = await axiosSecure.get("/v1/chat/rooms/");
      setChatRooms(res.data);

      if (res.data.length > 0) {
        let roomToSelect = res.data[0];
        if (roomId) {
          const found = res.data.find(
            (r) => String(r.id) === String(roomId)
          );
          if (found) roomToSelect = found;
        }
        setSelectedRoom(roomToSelect);
        fetchMessages(roomToSelect.id);
      }
    } catch (err) {
      console.error("Failed to fetch chat rooms", err);
    }
  };

  /* --------------------------------
     FETCH MESSAGES
  -------------------------------- */
  const fetchMessages = async (id) => {
    try {
      setLoadingMessages(true);
      const res = await axiosSecure.get(
        `/v1/chat/rooms/${id}/messages/`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  /* --------------------------------
     SEND MESSAGE
  -------------------------------- */
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const optimistic = {
      id: Date.now(),
      text: newMessage,
      is_mine: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    try {
      await axiosSecure.post(
        `/v1/chat/rooms/${selectedRoom.id}/messages/`,
        { text: newMessage }
      );
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  /* --------------------------------
     FILTER ROOMS
  -------------------------------- */
  const filteredRooms = chatRooms.filter((room) => {
    const other = getOtherParticipant(room);
    const name = `${other?.first_name || ""} ${other?.last_name || ""}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const otherUser = getOtherParticipant(selectedRoom);

  return (
    <div
      className={`flex h-[calc(100vh-64px)] pt-16 overflow-hidden ${
        isDark ? "bg-neutral-900 text-white" : "bg-gray-50 text-black"
      }`}
    >
      {/* ================= LEFT SIDEBAR ================= */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r ${
          isDark
            ? "border-neutral-800 bg-neutral-900"
            : "border-gray-200 bg-white"
        } ${selectedRoom && "hidden md:flex"}`}
      >
        <div className="p-5 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold mb-4">Messages</h2>
          <div
            className={`flex items-center rounded-xl px-4 py-2.5 ${
              isDark ? "bg-neutral-800" : "bg-gray-100"
            }`}
          >
            <MdSearch className="mr-2 opacity-50" size={20} />
            <input
              className="bg-transparent outline-none w-full text-sm"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center opacity-50 text-sm">
              No chats found
            </div>
          ) : (
            filteredRooms.map((room) => {
              const other = getOtherParticipant(room);
              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    fetchMessages(room.id);
                  }}
                  className={`flex gap-3 px-4 py-4 cursor-pointer border-l-4 ${
                    selectedRoom?.id === room.id
                      ? "border-red-600 bg-red-50 dark:bg-red-900/10"
                      : "border-transparent hover:bg-gray-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-700">
                    {other?.profile_picture ? (
                      <img
                        src={`${other.profile_picture}?t=${Date.now()}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-600 text-white font-bold">
                        {other?.first_name?.[0] || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">
                      {other?.first_name} {other?.last_name}
                    </h4>
                    <p className="text-xs opacity-60 truncate">
                      {room.last_message || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= CHAT WINDOW ================= */}
      <div className={`flex-1 flex flex-col ${!selectedRoom && "hidden md:flex"}`}>
        {selectedRoom ? (
          <>
            {/* HEADER */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden"
                  onClick={() => setSelectedRoom(null)}
                >
                  <MdArrowBack size={22} />
                </button>

                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-700">
                  {otherUser?.profile_picture ? (
                    <img
                      src={`${otherUser.profile_picture}?t=${Date.now()}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-600 text-white font-bold">
                      {otherUser?.first_name?.[0] || "?"}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm">
                    {otherUser?.first_name} {otherUser?.last_name}
                  </h3>
                  <span className="text-xs opacity-60">Active Now</span>
                </div>
              </div>

              <MdMoreVert size={22} />
            </div>

            {/* MESSAGES */}
            <div
              className={`flex-1 overflow-y-auto p-6 space-y-4 ${
                isDark ? "bg-[#0b141a]" : "bg-[#f0f2f5]"
              }`}
            >
              {loadingMessages ? (
                <div className="text-center opacity-50">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center opacity-40">
                  <MdChatBubbleOutline size={40} />
                  <p>Start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.is_mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] ${
                        msg.is_mine
                          ? "bg-red-600 text-white rounded-tr-none"
                          : isDark
                          ? "bg-neutral-800 text-white rounded-tl-none"
                          : "bg-white text-black rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div
              className={`p-4 border-t ${
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 ${
                  isDark ? "bg-neutral-800" : "bg-gray-100"
                }`}
              >
                <input
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-full ${
                    newMessage.trim()
                      ? "bg-red-600 text-white"
                      : "text-gray-400"
                  }`}
                >
                  <MdSend size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <MdChatBubbleOutline size={48} />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
