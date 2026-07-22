import {io} from "socket.io-client";

const SOCKET_URL = "https://chat-app-varun.vercel.app";

export const socket = io(SOCKET_URL, {
  autoConnect:false,
  withCredentials:true
})