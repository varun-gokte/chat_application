import express from "express";
import { User } from "../schemas/User.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import { createJwt } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup",async(req,res)=>{
  try{
    const {firstName, lastName, username, password} = req.body;
    
    const userExists = await User.exists({username});
    
    if (userExists)
      return res.sendStatus(400);
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = await User.create({firstName, lastName, username, password:hashedPassword});
    const token = createJwt(user);
    return res.status(200).json(token);
  }
  catch(err){
    console.log(err);
    return res.sendStatus(500);
  }
})

router.post("/login",async(req,res)=>{
  try{
    const {username, password} = req.body;
    
    const user = await User.findOne({username});
    if (!user)
      return res.sendStatus(400);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.sendStatus(400);
    
    const token = createJwt(user);
    return res.json(token);
  }
  catch(err){
    console.log(err);
    return res.sendStatus(500);
  }
})

export default router;