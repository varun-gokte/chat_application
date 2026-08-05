import {io} from "socket.io-client";

const SOCKET_URL = "https://chat-application-4an4.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect:false,
  withCredentials:true
})