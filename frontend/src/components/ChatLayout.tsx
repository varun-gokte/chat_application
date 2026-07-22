import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./ChatWindow";
import PanelHeader from "./PanelHeader";
import { useEffect, useRef, useState } from "react";
import type { Chat } from "../types";
import { getChats } from "../apis";
import { socket } from "../socket";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-blue-500",
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-fuchsia-500 to-indigo-500",
  "from-indigo-500 to-purple-500",
];
function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
function initialsFor(firstName?: string, lastName?: string, username?: string) {
  if (firstName) return `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase();
  return (username ?? "?").slice(0, 2).toUpperCase();
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function ChatLayout({ username, userId }: { username: string; userId: string }) {
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat>();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [newMessage, setNewMessage] = useState(null);
  const [updatedStatuses, setUpdatedStatuses] = useState<Record<string, string>>({});

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    getChats().then((res) => {
      if (res.status == 200) setChatsList(res.data);
    });
  }, []);

  const currentChatRef = useRef(currentChat);
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    socket.auth = { userId: userId };
    socket.connect();
    socket.on("connect", () => console.log("socket connected", socket.id));
    socket.on("disconnect", () => console.log("socket disconnected", socket.id));

    socket.on("new_chat", (c) => setChatsList((prev) => [...prev, c]));
    socket.on("new_message", (data) => {
      const { chatId, message } = data;
      if (userId == message.receiverId)
        socket.emit("message_delivered", { messageId: message._id, senderId: message.senderId });
      setChatsList((prev) =>
        prev.map((chat) => (chat._id === chatId ? { ...chat, lastMessage: message } : chat))
      );
      setNewMessage(message);
      if (chatId !== currentChatRef.current?._id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] ?? 0) + 1,
        }));
      }
    });
    socket.on("message_status_update", ({ messageIds, status }) => {
      setUpdatedStatuses((prev) => ({
        ...prev,
        ...messageIds.reduce((acc: any, id: any) => ({ ...acc, [id]: status }), {}),
      }));
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    setUnreadCounts((prev) => ({ ...prev, [chat._id]: 0 }));
    setMobileView("chat");
  };

  const otherParticipant = (chat?: Chat) => chat?.participants?.find((p) => p.username !== username);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F7F8FC] overflow-hidden">
      <aside
  className={`
    ${mobileView === "list" ? "flex" : "hidden"} md:flex
    relative w-full shrink-0 h-full flex-col
    bg-gradient-to-b from-[#3F51B5] to-[#2E3B8F]
    border-r border-white/10 shadow-xl
    transition-[width] duration-200 ease-in-out
    ${collapsed ? "md:w-[84px]" : "md:w-[340px] lg:w-[380px]"}
  `}
>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand conversation list" : "Collapse conversation list"}
          className="
            hidden md:flex absolute -right-3 top-6 z-10
            w-6 h-6 rounded-full items-center justify-center
            bg-white text-[#3F51B5] shadow-md border border-gray-100
            hover:bg-indigo-50 transition-colors cursor-pointer
          "
        >
          {collapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
        </button>

        <div className="p-4 pb-2 shrink-0">
          <PanelHeader setCurrentChat={setCurrentChat} collapsed={collapsed} />
        </div>

        <div className={`flex-1 overflow-y-auto py-3 flex flex-col gap-1.5 ${collapsed ? "px-2 items-center" : "px-3"}`}>
          {chatsList.length === 0 && !collapsed && (
            <div className="text-white/60 text-sm text-center mt-10 px-4">
              No conversations yet. Start one with the + button above.
            </div>
          )}

          {chatsList.map((chat) => {
            if (!chat || Object.keys(chat).length == 0) return null;
            const otherUser = otherParticipant(chat);
            if (!otherUser) return null;
            const content = chat.lastMessage?.content;
            const timestamp = chat.lastMessage?.timestamp || chat.lastMessage?.createdAt;
            const isSelected = currentChat?._id === chat._id;
            const unread = unreadCounts[chat._id] ?? 0;
            const name = otherUser.firstName ? `${otherUser.firstName} ${otherUser.lastName ?? ""}` : otherUser.username;

            if (collapsed) {
              return (
                <motion.div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.12 }}
                  className="relative cursor-pointer w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  title={name}
                >
                  <div
                    className={`
                      w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm
                      bg-gradient-to-br ${gradientFor(otherUser.username || otherUser.firstName || "?")}
                      ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#3F51B5]" : ""}
                    `}
                  >
                    {initialsFor(otherUser.firstName, otherUser.lastName, otherUser.username)}
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-[#3F51B5]">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={chat._id}
                onClick={() => selectChat(chat)}
                whileHover={{ x: isSelected ? 0 : 2 }}
                transition={{ duration: 0.12 }}
                className={`
                  relative cursor-pointer rounded-xl pl-3 pr-3 py-2.5 flex items-center gap-3 w-full
                  transition-colors duration-150
                  ${isSelected ? "bg-white shadow-md" : "hover:bg-white/10"}
                `}
              >
                {isSelected && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#3F51B5]" />
                )}
                <div
                  className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br ${gradientFor(
                    otherUser.username || otherUser.firstName || "?"
                  )}`}
                >
                  {initialsFor(otherUser.firstName, otherUser.lastName, otherUser.username)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className={`font-semibold text-[15px] truncate ${isSelected ? "text-gray-900" : "text-white"}`}>
                      {name}
                    </span>
                    <span className={`text-[11px] whitespace-nowrap ${isSelected ? "text-gray-400" : "text-white/60"}`}>
                      {timestamp &&
                        (() => {
                          const date = new Date(timestamp);
                          const today = new Date();
                          const isToday = date.toDateString() === today.toDateString();
                          return isToday
                            ? date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                            : date.toLocaleString("en-GB", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
                        })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 mt-0.5">
                    <span className={`text-[13px] truncate ${isSelected ? "text-gray-500" : "text-white/70"}`}>
                      {content ?? "No messages yet"}
                    </span>
                    {unread > 0 && (
                      <span className="shrink-0 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </aside>

      <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col overflow-hidden`}>
        <div className="px-4 py-3 border-b border-gray-200 bg-white shadow-sm shrink-0 flex items-center gap-3">
          <button
            onClick={() => setMobileView("list")}
            className="md:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Back to conversations"
          >
            <BackIcon />
          </button>

          {(() => {
            const other = otherParticipant(currentChat);
            if (!other) {
              return (
                <div className="flex flex-col">
                  <div className="text-xl font-semibold text-gray-700">Select a conversation</div>
                  <div className="text-sm text-gray-500">Choose a chat to start messaging or create a new one</div>
                </div>
              );
            }
            return (
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`shrink-0 w-9 h-9 rounded-full hidden sm:flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-br ${gradientFor(
                    other.username || other.firstName || "?"
                  )}`}
                >
                  {initialsFor(other.firstName, other.lastName, other.username)}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-gray-800 truncate">
                    {other.firstName} {other.lastName}
                  </div>
                  <div className="text-xs text-gray-500">@{other.username}</div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="flex-1 flex justify-center items-center overflow-hidden bg-[#F7F8FC]">
          <AnimatePresence mode="wait">
            {currentChat ? (
              <motion.div
                key={currentChat._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <ChatWindow
                  currentChat={currentChat}
                  userId={userId}
                  newMessage={newMessage}
                  updatedStatuses={updatedStatuses}
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-[#3F51B5]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div className="text-sm">Pick a conversation on the left to start chatting</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}