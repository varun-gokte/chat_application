import { motion } from "framer-motion";
import ChatWindow from "./ChatWindow";
import PanelHeader from "./PanelHeader";
import { useEffect, useState } from "react";
import type { Chat } from "../types";
import { getChats } from "../apis";

export default function ChatLayout({username, userId, firstName}: {username:string, userId:string, firstName: string}) {
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat>();  

  useEffect(()=>{
    getChats().then(res=>{
      if (res.status==200)
        setChatsList(res.data);
    })
  },[]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {firstName}
      <aside className=" w-1/4 h-full p-3 flex flex-col gap-3 backdrop-blur-lg bg-[rgba(18,31,98,0.55)] border-r border-[rgba(255,255,255,0.08)] shadow-2xl shadow-lg">
       <PanelHeader setCurrentChat={setCurrentChat} />
        <div className="flex flex-col gap-2">
          {chatsList.map((chat,index) => {
            const otherUser = chat.participants.filter(p=>p.username!=username)[0];
            const content = chat.lastMessage?.content;
            const timestamp = chat.lastMessage?.timestamp;
            const isSelected = currentChat?._id === chat._id;
            // const unread = currentChat?.lastMessage.
            return (
              <motion.div
                key={index}
                onClick={() => setCurrentChat(chat)}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
                transition={{ duration: 0.12 }}
                className={`cursor-pointer rounded-xl px-3 py-2 text-white/90 border border-white/20 flex flex-col gap-1 transition-all duration-150
                  ${isSelected?"bg-red-400/70 text-black shadow-[0_0_12px_rgba(255,255,255,0. 8)] border-white":"bg-white/15 text-white/90"}
                `}
              >
                {/* Name */}
                <div className="font-semibold text-lg">
                  {otherUser.firstName || otherUser.lastName
                    ? `${otherUser.firstName ?? ""} ${otherUser.lastName ?? ""}`
                    : otherUser.username}
                </div>

                {/* Last message + timestamp */}
                <div className="flex justify-between text-sm text-white/70">
                  <span className="truncate max-w-[70%]">{content}</span>
                  <span className="whitespace-nowrap">
                    {timestamp && new Date(timestamp).toLocaleTimeString([], {
                      day:"numeric",
                      month:"numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
        <div className="flex-1 flex justify-center items-center p-6 overflow-hidden bg-gray-50">
          {currentChat && (
            <div className="w-full max-w-[750px] h-full">
              <ChatWindow currentChat={currentChat} userId={userId} />
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
  );
}
