import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {type: Schema.Types.ObjectId, ref:"User", required: true},
  chatId: {type: Schema.Types.ObjectId, ref:"Chat", required: true},
  content: {type: String, required: true},
  seenBy: [{type: Schema.Types.ObjectId, ref:"User"}],
},{ timestamps:true });

export const Message = mongoose.model("Message",messageSchema)