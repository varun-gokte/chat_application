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
  }
}

type Message = {
  senderId: string;
  chatId: string;
  content: string;
  seenBy: User[];
  createdAt: string;
}

interface AuthToken extends JwtPayload {
  username?: string;
  userId?: string;
  firstName?:string;
}

export { type User, type Chat, type Message, type AuthToken }