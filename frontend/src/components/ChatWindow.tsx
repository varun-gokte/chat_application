import { useEffect, useRef, useState } from "react";
import { TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { motion } from "framer-motion";
import type { Chat, Message } from "../types";
import { createMessage, getMessages } from "../apis";
import { socket } from "../socket";

export default function ChatWindow(props: {
  currentChat: Chat | undefined;
  userId: string | undefined;
}) {
  const { currentChat, userId } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;

    return (
      el.scrollHeight - el.scrollTop - el.clientHeight < 100
    );
  };

  useEffect(() => {
    if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
    } else {
      setHasNewMessages(true);
    }
  }, [messages]);
  
  useEffect(() => {
    if (!currentChat?._id) return;

    getMessages(currentChat._id).then(res=>{
      if (res.status==200)
        setMessages(res.data)
      else
        setMessages([]);
    })
  }, [currentChat?._id]);

  useEffect(()=>{
    if (!currentChat?._id) return;
    
    socket.emit("join_room", currentChat._id);

    socket.on("new_message", (m) => setMessages(prev=>[...prev,m.message]))
  },[currentChat?._id])

  const sendMessage = () => {
    if (!input.trim() || !currentChat) return;

    createMessage(currentChat._id, input).then(_ => {
      // if (res.status==200){console.log("messages",messages)
      //   setMessages(curr=>[...curr,res.data]);}
    })
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleScroll = () => {
    if (isNearBottom()) {
      setHasNewMessages(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-160px)] flex flex-col bg-gray-100 p-4">    
      {/* Messages List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-3 p-2 relative"
      >
        {messages.map((msg, i) => {
          const isMe = msg.senderId === userId;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-xs p-3 rounded-2xl shadow-md text-white text-sm ${
                isMe ? "bg-[#3F51B5] ml-auto" : "bg-[#37474F]"
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-[10px] text-gray-200 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {hasNewMessages && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setHasNewMessages(false);
            }}
            className="bg-[#3F51B5] text-white text-xs px-4 py-2 rounded-full shadow-lg hover:bg-[#303F9F] transition"
          >
            New messages <ArrowDownwardIcon fontSize="small"/>
          </button>
        </div>
      )}

      {/* Input */}
      <Paper className="flex items-center p-2 gap-2" elevation={3}>
        <TextField
          fullWidth
          multiline
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton color="primary" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Paper>
    </div>
  );
}
