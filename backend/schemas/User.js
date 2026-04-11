import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {type:String, required: true},
  lastName: {type:String, required: true},
  username: {type:String, required: true},
  password: {type:String, required: true},
});

userSchema.index({ username: "text", firstName: "text", lastName: "text" });

export const User = mongoose.model("User",userSchema)