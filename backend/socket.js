import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  })

  io.on('connect',(socket)=>{
    console.log('socket connected', socket.id)

    const userId = socket.handshake.auth.userId;
    if (userId)
      socket.join(userId);

    socket.on("join_room", (chatId) => {
      if (!chatId){
        console.log("join chat called without chatId")
        return
      }
      socket.join(chatId)
      console.log(`Socket ${socket.id} joined the chat ${chatId}`)
    })

    socket.on('disconnect', ()=>{
      console.log('socket disconnected')
    })
  })

  return io;
}

export const getIO = () => {
  if (!io)
    throw new Error ("Socket not initialized")
  return io;
}