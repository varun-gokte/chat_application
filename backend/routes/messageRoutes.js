import express from "express";
import "dotenv/config";

import { Chat } from "../schemas/Chat.js";
import { Message } from "../schemas/Message.js";
import mongoose from "mongoose";
import {getIO} from "./../socket.js"
const router = express.Router();

router.get("/", async (req,res) => {
  try {
    const chatId = req.query.chatId;
    const id = new mongoose.Types.ObjectId(chatId);
    const messages = await Message.find({chatId:id}).sort({createdAt: 1}).limit(30)
    return res.status(200).json({messages})
  }
  catch(err){
    console.log(err);
    return res.sendStatus(500);
  }
})

router.post("/new", async (req,res) => {
  try{
    const {userId} = req.user;
    const {chatId, content} = req.body;
    const newMessage = await Message.create({
      senderId: userId,
      chatId,
      content,
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
    const io = getIO()
    io.to(chatId).emit("new_message", newMessage);
    return res.status(200).json({message:newMessage});
  }
  catch(err){
    console.log(err);
    return res.status(500);
  }
})

export default router;