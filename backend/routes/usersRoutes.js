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
});

router.put("/me", async (req,res)=>{
  try{
    const {userId} = req.user;
    const {firstName, lastName, currentPassword, newPassword } = req.body;

    const fieldsToBeUpdated = {};

    if (firstName!=undefined) fieldsToBeUpdated.firstName = firstName;
    if (lastName!=undefined) fieldsToBeUpdated.lastName = lastName;
    
    if (newPassword!=undefined && currentPassword!=undefined) {
      const user = await User.findById(userId);

      const isMatch = await bcrypt.compare(currentPassword,user.password)
      if (isMatch){
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        fieldsToBeUpdated.password = hashedPassword;
      }
      else{
        return res.status(400).json({ message: "Current password is incorrect." });
      }
    }

    if (Object.keys(fieldsToBeUpdated).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }
    const user = await User.findByIdAndUpdate(userId, { $set: fieldsToBeUpdated }, { new: true, runValidators: true });

    return res.status(200).json({ message: "User information updated successfully." });
  }
  catch(err){
    console.log(err)
    res.send(500);
  }
})

export default router;