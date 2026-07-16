import express from "express";
import "dotenv/config";

import { Chat } from "../schemas/Chat.js";
import { Message } from "../schemas/Message.js";
import mongoose from "mongoose";
import {getIO} from "./../socket.js"
const router = express.Router();

router.get("/", async (req,res) => {
  try {
      const {chatId, before} = req.query;
    const id = new mongoose.Types.ObjectId(chatId);
    const LIMIT = 30;
    const query = { chatId: id};

    if (before) query._id = { $lt: new mongoose.Types.ObjectId(before) };

   const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(LIMIT + 1)
      .then(msgs => msgs.reverse());
   const hasMore = messages.length > LIMIT;
    if (hasMore) messages.shift();

    return res.status(200).json({ messages, hasMore });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
})

router.post("/new", async (req,res) => {
  try{
    const io = getIO()
    const {userId} = req.user;
    const {chatId, content} = req.body;
    
    const chat = await Chat.findById(chatId).populate("participants");
    const recepientId = chat.participants.find((participant) => participant._id.toString() !== userId)._id.toString();
    const newMessage = await Message.create({
      senderId: userId,
      receiverId: recepientId,
      chatId,
      content,
      status: "sent",
      seenBy: [userId]
    });
  
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        messageId: newMessage._id,
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        sender: userId
      }
    })
    
    chat.participants.forEach((participant) => {
      const participantId = participant._id.toString();
        if (participantId === userId) 
          io.to(participantId).emit("new_message", { chatId, message: newMessage, sender: userId });

        else{
          const recipientSockets = io.sockets.adapter.rooms.get(participantId);
          const isOnline = recipientSockets?.size > 0;
          console.log(`User ${participantId} is ${isOnline ? "online" : "offline"}`); 
          if (isOnline)
            io.to(participantId).emit("new_message", { chatId, message: newMessage, sender: userId });
        }      
    });
    return res.status(200).json({message:newMessage});
  }
  catch(err){
    console.log(err);
    return res.status(500);
  }
})

export default router;