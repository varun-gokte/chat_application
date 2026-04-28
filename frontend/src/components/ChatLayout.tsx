import { motion } from "framer-motion";
import ChatWindow from "./ChatWindow";
import PanelHeader from "./PanelHeader";
import { useEffect, useRef, useState } from "react";
import type { Chat } from "../types";
import { getChats } from "../apis";
import { socket } from "../socket";

export default function ChatLayout({username, userId}: {username:string, userId:string}) {
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat>();  
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  useEffect(()=>{
    getChats().then(res=>{
      if (res.status==200)
        setChatsList(res.data);
    })
  },[]);

  const currentChatRef = useRef(currentChat);
    useEffect(() => {
      currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(()=> {
    socket.auth = { userId: userId}
    socket.connect();
    socket.on("connect", () => console.log('socket connected',socket.id));
    socket.on("disconnect",() => console.log('socket disconnected', socket.id));
    
    socket.on("new_chat", (c) => setChatsList(prev=>[...prev,c]));
    socket.on("new_message", ({ chatId, message }) =>{
      setChatsList(prev =>
        prev.map(chat =>
          chat._id === chatId
            ? { ...chat, lastMessage: message }
            : chat
        )
      );
      if (chatId !== currentChatRef.current?._id) {
        setUnreadCounts(prev => ({
          ...prev,
          [chatId]: (prev[chatId] ?? 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    }
  },[]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      <aside className=" w-1/4 h-full p-3 flex flex-col gap-3 backdrop-blur-lg bg-[rgba(18,31,98,0.55)] border-r border-[rgba(255,255,255,0.08)] shadow-2xl shadow-lg">
       <PanelHeader setCurrentChat={setCurrentChat} />
        <div className="flex flex-col gap-2">
          {chatsList.map((chat,index) => {
            if (!chat ||Object.keys(chat).length==0)
              return <div></div>;
            const otherUser = chat.participants?.filter(p=>p.username!=username)[0];
            const content = chat.lastMessage?.content;
            const timestamp = chat.lastMessage?.timestamp || chat.lastMessage?.createdAt;
            const isSelected = currentChat?._id === chat._id;
            const unread = unreadCounts[chat._id] ?? 0;
            
            return (
              <motion.div
                key={index}
                onClick={() => {
                  setCurrentChat(chat); 
                  setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));
                }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
                transition={{ duration: 0.12 }}
                className={`cursor-pointer rounded-xl px-3 py-2 text-white/90 border border-white/20 flex flex-col gap-1 transition-all duration-150
                  ${isSelected?"bg-red-400/70 text-black shadow-[0_0_12px_rgba(255,255,255,0. 8)] border-white":"bg-white/15 text-white/90"}
                `}
              >
              <div className="flex justify-between items-center">
                  <div className="font-semibold text-lg">
                    {otherUser.firstName ? `${otherUser.firstName} ${otherUser.lastName ?? ""}` : otherUser.username}
                  </div>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                {/* Last message + timestamp */}
                <div className="flex justify-between text-sm text-white/70">
                  <span className="truncate max-w-[70%]">{content}</span>
                  <span className="whitespace-nowrap">
                    {timestamp && (() => {
                      const date = new Date(timestamp);
                      const today = new Date();
                      const isToday = date.toDateString() === today.toDateString();
                      if (isToday) {
                        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      } else {
                        return date.toLocaleString([], { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
                      }
                    })()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Wrapper under navbar */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat Header */}
          <div className="p-2 border-b bg-white shadow-sm shrink-0">
            {(() => {
            const other = currentChat?.participants.find(p => p.username !== username);

            if (!other) {
              return (
                <div className="flex flex-col text-center">
                  <div className="text-2xl font-semibold text-gray-700">
                    Select a Conversation
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Choose a chat to start messaging or create a new chat
                  </div>
                </div>
              );
            }

            return (
              <div className="flex flex-col">
                <div className="text-2xl font-semibold text-gray-800">
                  {other.firstName} {other.lastName}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  @{other.username}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ChatBody (contains ChatWindow) */}
        <div className="flex-1 flex justify-center items-center py-6 overflow-hidden bg-gray-50">
          {currentChat && (
            <div className="w-full h-full">
              <ChatWindow currentChat={currentChat} userId={userId} />
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
  );
}
