import express from "express";
import "dotenv/config";
import { User } from "../schemas/User.js";

const router = express.Router();

router.get("/",async (req,res)=>{
  try{
    const {userId} = req.user
    const search = req.query.search;
    if (!search || search.trim()=="")
      return res.json([]);

    const regex = new RegExp(search, "i");

    const results = await User.find({
      _id: {$ne: userId},
      $or:[
        {username: regex},
        {firstName: regex},
        {lastName: regex}
      ]
    }).limit(10).select("username firstName lastName")

    res.json(results)
  }
  catch(err){
    console.log(err)
    res.send(500);
  }
})

export default router;