import Tooltip from '@mui/material/Tooltip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InboxIcon from '@mui/icons-material/Inbox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { motion } from 'framer-motion';
import type { Message, MessageStatus } from '../types';

const statusConfig = {
  sent:      { Icon: AccessTimeIcon, color: 'rgba(255,255,255,0.35)', label: 'Sent' },
  delivered: { Icon: InboxIcon,      color: 'rgba(255,255,255,0.8)',  label: 'Delivered' },
  read:      { Icon: VisibilityIcon, color: '#7CEFB8',                label: 'Read' },
};

const MessageStatus = ({ status }: { status: MessageStatus }) => {
  const { Icon, color, label } = statusConfig[status] ?? statusConfig.sent;
  return (
    <Tooltip title={label} placement="top" arrow>
      <Icon sx={{ fontSize: 13, color, cursor: 'default' }} />
    </Tooltip>
  );
};

const MessageBubble = ({ message, currentUserId }: { message: Message; currentUserId: string }) => {
  const isMe = message.senderId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '72%',
          padding: '10px 14px',
          borderRadius: 18,
          ...(isMe
            ? { borderBottomRightRadius: 4, background: '#3F51B5' }
            : { borderBottomLeftRadius:  4, background: '#37474F' }
          ),
          color: 'white',
          fontSize: 14,
        }}
        className={isMe ? 'bubble-me' : 'bubble-them'}
      >
        <div>{message.content}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && <MessageStatus status={message.status ?? 'sent'} />}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;