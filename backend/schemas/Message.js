import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {type: Schema.Types.ObjectId, ref:"User", required: true},
  chatId: {type: Schema.Types.ObjectId, ref:"Chat", required: true},
  content: {type: String, required: true},
  status: {type: String, enum:["sent", "delivered", "seen"], default:"sent"},
  seenBy: [{type: Schema.Types.ObjectId, ref:"User"}],
},{ timestamps:true });

export const Message = mongoose.model("Message",messageSchema)