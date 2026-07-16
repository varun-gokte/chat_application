import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { Chat, Message, MessageStatus } from "../types";
import { createMessage, getMessages } from "../apis";
import MessageBubble from "./MessageBubble";
import { socket } from "../socket";

export default function ChatWindow(props: {
  currentChat: Chat | undefined;
  userId: string | undefined;
  newMessage: Message | null;
  updatedStatuses: Record<string, string>;
}) {
  const { currentChat, userId, newMessage, updatedStatuses } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const oldestMsgIdRef = useRef<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingReadIds = useRef<Set<string>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPrependingRef = useRef(false);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  const isInitialLoad = useRef(true);

  // Reset on chat change
  useEffect(() => {
    if (!currentChat?._id) return;
    isInitialLoad.current = true;
    setHasNewMessages(false);
    getMessages(currentChat._id).then((res) => {
      if (res.status === 200) {
        setMessages(res.data.messages);
        setHasMore(res.data.hasMore);
        oldestMsgIdRef.current = res.data.messages[0]?._id;
      } else {
        setMessages([]);
      }
      setHasMore(true);
      setLoadingMore(false);
    });
  }, [currentChat?._id]);

  // Handle new message
  useEffect(() => {
    if (!currentChat?._id) return;
    if (newMessage && newMessage.chatId === currentChat._id) {
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [newMessage, currentChat?._id]);

  // Scroll behavior: instant jump on load, smooth scroll for new messages
  useLayoutEffect(() => {
    if (messages.length === 0) return;

    if (isInitialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      isInitialLoad.current = false;
      setHasNewMessages(false);
    } else if (isPrependingRef.current) {
      isPrependingRef.current = false;
    } else if (isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasNewMessages(false);
    } else {
      setHasNewMessages(true);
    }
  }, [messages, currentChat?._id]);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  useEffect(() => {
    if (!currentChat?._id) return;
    if (Object.keys(updatedStatuses).length === 0) return;
    setMessages((prev) => {
      const updated = prev.map((msg) => {
        const status = updatedStatuses[msg._id.toString()] as MessageStatus;
        return status ? { ...msg, status } : msg;
      });
      return [...updated];
    });
  }, [updatedStatuses, currentChat?._id]);

  const sendMessage = () => {
    if (!input.trim() || !currentChat) return;
    setError(null);
    createMessage(currentChat._id, input).then((res) => {
      if (res.status !== 200) {
        setError("Failed to send message");
      }
    });
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

  const fetchMoreMessages = useCallback(async () => {
    if (!currentChat?._id || !hasMore || loadingMore) return;
    if (!oldestMsgIdRef.current) return;

    setLoadingMore(true);

    const container = containerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    const res = await getMessages(currentChat._id, oldestMsgIdRef.current);
    if (res.status === 200) {
      const older = res.data.messages;
      setHasMore(res.data.hasMore);
      if (older.length > 0) {
        oldestMsgIdRef.current = older[0]._id;
        isPrependingRef.current = true;
        setMessages((prev) => [...older, ...prev]);
      }
    }

    setLoadingMore(false);

    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - prevScrollHeight;
      }
    });
  }, [currentChat?._id, hasMore, loadingMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInitialLoad.current) {
          fetchMoreMessages();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchMoreMessages]);

  const flushReadQueue = useCallback(() => {
    if (pendingReadIds.current.size === 0) return;
    if (document.visibilityState !== "visible") return;

    const ids = [...pendingReadIds.current];
    pendingReadIds.current.clear();
    const senderId = currentChat?.participants.find((p) => p._id !== userId)?._id;
    socket.emit("mark_read", { messageIds: ids, senderId: senderId });
  }, [socket, currentChat]);

  const handleMessageRead = useCallback(
    (messageId: string) => {
      pendingReadIds.current.add(messageId);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(flushReadQueue, 600);
    },
    [flushReadQueue]
  );

  // Flush on tab becoming visible again
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") flushReadQueue();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [flushReadQueue]);

  // Clear pending queue when chat changes
  useEffect(() => {
    pendingReadIds.current.clear();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, [currentChat?._id]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F7F8FC]">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-1"
      >
        <div ref={sentinelRef} style={{ height: 1 }} />

        {loadingMore && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-2">
            <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-[#3F51B5] animate-spin" />
            Loading older messages…
          </div>
        )}

        {messages.length === 0 && !loadingMore && (
          <div className="h-full flex items-center justify-center text-sm text-gray-400 py-10">
            No messages yet — say hello 👋
          </div>
        )}

        {messages.map((msg, index) => {
          const currentDate = new Date(msg.createdAt).toDateString();
          const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
          const showSeparator = currentDate !== prevDate;
          return (
            <div key={msg._id}>
              {showSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="bg-white text-gray-500 text-xs font-medium px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {formatDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble message={msg} currentUserId={userId!} onRead={handleMessageRead} />
            </div>
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
            className="flex items-center gap-1.5 bg-[#3F51B5] text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg hover:bg-[#303F9F] transition-colors"
          >
            New messages
            <ArrowDownwardIcon sx={{ fontSize: 14 }} />
          </button>
        </div>
      )}
      {error && (
        <div className="mx-auto mb-2 text-red-600 bg-red-50 border border-red-200 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div className="px-4 sm:px-6 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(63,81,181,0.06)] shrink-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <TextField
            fullWidth
            multiline
            maxRows={5}
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor: "#EEF0FA",
                "& fieldset": { borderColor: "#D6DAF0" },
                "&:hover fieldset": { borderColor: "#3F51B5" },
                "&.Mui-focused fieldset": { borderColor: "#3F51B5", borderWidth: "1.5px" },
                "& input::placeholder, & textarea::placeholder": {
                  color: "#6B7280",
                  opacity: 1,
                },
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!input.trim()}
            sx={{
              backgroundColor: input.trim() ? "#3F51B5" : "#DDE1F2",
              color: input.trim() ? "#fff" : "#8A90B8",
              width: 40,
              height: 40,
              flexShrink: 0,
              transition: "background-color 0.15s, color 0.15s",
              "&:hover": { backgroundColor: input.trim() ? "#303F9F" : "#DDE1F2" },
              "&.Mui-disabled": { color: "#8A90B8", backgroundColor: "#DDE1F2" },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}