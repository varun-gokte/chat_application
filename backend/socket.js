import { Server } from "socket.io";
import { Message } from "./schemas/Message.js ";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  })

  io.on('connect', async (socket)=>{
    console.log('socket connected', socket.id)

    const userId = socket.handshake.auth.userId;
    if (userId) socket.join(userId);

    const pendingMessages = await Message.find({receiverId:userId, status: "sent"});
    if (pendingMessages.length > 0) {
      // update all to delivered in one shot
      const pendingIds = pendingMessages.map(m => m._id);
      await Message.updateMany({ _id: { $in: pendingIds } }, { status: 'delivered' });

      // group by sender so we can notify each sender
      const grouped = pendingMessages.reduce((acc, msg) => {
        const senderId = msg.senderId.toString();
        if (!acc[senderId]) acc[senderId] = [];
        acc[senderId].push(msg._id);
        return acc;
      }, {});

      // notify each sender their messages were delivered
      for (const [senderId, messageIds] of Object.entries(grouped)) {
        io.to(senderId).emit("message_status_update", { messageIds, status: 'delivered' });
      }
    }
  
    socket.on("message_delivered", async ({ messageId, senderId }) => {
      await Message.findByIdAndUpdate(messageId, { status: 'delivered' });

      io.to(senderId).emit("message_status_update", { messageIds:[messageId], status: 'delivered' });
    })

    socket.on("mark_read", async ({messageIds, senderId}) => {
      await Message.updateMany({ _id: { $in: messageIds } }, { status: 'read' });
      console.log(`Messages ${messageIds} marked as read to sender ${senderId}`);
      io.to(senderId).emit("message_status_update", { messageIds, status: 'read' });
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