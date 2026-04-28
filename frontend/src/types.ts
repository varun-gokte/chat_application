import type { JwtPayload } from "jwt-decode";

type User = {
  _id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
};

type Chat = {
  _id: string;
  participants: User[];
  lastMessage?: {
    messageId: string,
    content: string,
    timestamp: string,
    sender: User
  createdAt: string;
  };
  updatedAt?:string;
}

type Message = {
  senderId: string;
  chatId: string;
  content: string;
  seenBy: User[];
  createdAt: string;
  status?: MessageStatus;
}

type MessageStatus = "sent" | "delivered" | "read";

interface AuthToken extends JwtPayload {
  username?: string;
  userId?: string;
  firstName?:string;
  lastName?:string;
}

export { type User, type Chat, type Message, type MessageStatus, type AuthToken }