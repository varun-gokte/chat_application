import mongoose, { Schema } from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{type: Schema.Types.ObjectId, ref:"User", required:true}],
  lastMessage: {
    messageId:{type: Schema.Types.ObjectId, ref:"Message"},
    content: String,
    timestamp:Date,
    sender: {type: Schema.Types.ObjectId, ref:"User"}
  },
},
  { timestamps:true }
);

export const Chat = mongoose.model("Chat",chatSchema)