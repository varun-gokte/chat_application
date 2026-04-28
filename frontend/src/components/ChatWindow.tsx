import { useEffect, useRef, useState } from "react";
import { TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { Chat, Message } from "../types";
import { createMessage, getMessages } from "../apis";
import { socket } from "../socket";
import MessageBubble from "./MessageBubble";

export default function ChatWindow(props: {
  currentChat: Chat | undefined;
  userId: string | undefined;
}) {
  const { currentChat, userId } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const isInitialLoad = useRef(true);

// Reset on chat change
useEffect(() => {
  if (!currentChat?._id) return;
  isInitialLoad.current = true;
  getMessages(currentChat._id).then(res => {
    if (res.status == 200) setMessages(res.data);
    else setMessages([]);
  });
}, [currentChat?._id]);

// Scroll behavior: instant jump on load, smooth scroll for new messages
useEffect(() => {
  if (messages.length === 0) return;

  if (isInitialLoad.current) {
    bottomRef.current?.scrollIntoView({ behavior: "instant" }); // no animation on load
    isInitialLoad.current = false;
    setHasNewMessages(false);
  } else if (isNearBottom()) {
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
    setError(null);   
    createMessage(currentChat._id, input).then(res => {
      if (res.status !== 200) {
        // Handle error
        setError("Failed to send message");
      }
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
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-3 p-2 relative">
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} currentUserId={userId!} />)}
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
      {error && (
        <div className="text-red-500 border border-red-500 text-sm px-4 py-2 rounded mx-auto mt-4">
          {error}
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
