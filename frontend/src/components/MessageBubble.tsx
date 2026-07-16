import Tooltip from '@mui/material/Tooltip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InboxIcon from '@mui/icons-material/Inbox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';
import type { Message, MessageStatus } from '../types';
import { useEffect, useRef } from 'react';

const statusConfig = {
  sent: { Icon: AccessTimeIcon, color: 'rgba(255,255,255,0.55)', label: 'Sent' },
  delivered: { Icon: InboxIcon, color: 'rgba(255,255,255,0.85)', label: 'Delivered' },
  read: { Icon: VisibilityIcon, color: '#7CEFB8', label: 'Read' },
};

const MessageStatus = ({ status }: { status: MessageStatus }) => {
  const { Icon, color, label } = statusConfig[status] ?? statusConfig.sent;
  return (
    <Tooltip title={label} placement="top" arrow>
      <Icon sx={{ fontSize: 13, color, cursor: 'default' }} />
    </Tooltip>
  );
};

const MessageBubble = ({
  message,
  currentUserId,
  onRead,
}: {
  message: Message;
  currentUserId: string;
  onRead: (id: string) => void;
}) => {
  const isMe = message.senderId === currentUserId;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only observe incoming, unread messages
    if (isMe || message.status === 'read') return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onRead(message._id);
          observer.disconnect(); // one-shot
        }
      },
      { threshold: 0.5 } // at least half the bubble must be visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMe, message._id, message.status, onRead]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      ref={ref}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          relative max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed
          ${isMe
            ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-[#3F51B5] to-[#4C5FC7] text-white shadow-md shadow-indigo-900/10'
            : 'rounded-2xl rounded-bl-md bg-white text-gray-800 border border-gray-100 shadow-sm'
          }
        `}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && <MessageStatus status={message.status ?? 'sent'} />}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;