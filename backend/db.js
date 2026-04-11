import mongoose from "mongoose";
import "dotenv/config";
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI||"",{
      dbName: "chat_db"
    })
    console.log("MongoDB connected")
  }
  catch(err){
    console.error("MongoDB connection error:", err)
  }
}