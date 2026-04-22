import express from "express";
import "dotenv/config";
import { Chat } from "../schemas/Chat.js";
import { getIO } from "../socket.js";

const router = express.Router();

router.get("/", async (req,res)=>{
  const {userId} = req.user;
  const chats = await Chat.find({ participants: userId})
    .select("participants lastMessage")
  .populate("participants");

  return res.json({chats});
})

router.post("/new", async (req,res)=>{
  try{
    const {userId} = req.user;
    const {participantId} = req.body;

    const existingChat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (existingChat)
      return res.sendStatus(400)
    
    const newChat = await (await Chat.create({participants:[userId, participantId]})).populate("participants");

    if (!newChat)
      return res.sendStatus(500);

    const io = getIO()
    io.to(userId).emit("new_chat", newChat);
    io.to(participantId).emit("new_chat", newChat);

    return res.status(200).json({chat: newChat})
  }
  catch(err){
    console.log(err);
    return res.sendStatus(500);
  }
})

export default router;