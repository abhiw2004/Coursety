const express = require("express")
const {User,Purchase}  = require("../db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()
const userRouter = express.Router();
const zod  = require("zod")
const {userMiddleWare} = require("../middleware/user")
    userRouter.post("/signup",async (req,res)=>{
    const {email , password, firstName, lastName} = req.body;
    
    if(!email || !password){
         return res.status(400).json({
            message : "enter username or password"
        })
    }
    
    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({
          message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await User.create({email, password : hashedPassword,firstName, lastName})

    const token = jwt.sign({userId : user._id},process.env.USER_JWT_SECRET,)
    res.json({
        message: "You are signed up"
    })
    })
    userRouter.post("/signin", async function(req,res){
        const {email,password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                message:"Email or password incorrect"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
            return res.status(404).json({
                message:"Email or password incorrect"
            })
        }
        const token = jwt.sign({userId:user._id},process.env.USER_JWT_SECRET)
        res.json({
            token
        })
    })
    userRouter.get("/purchases",userMiddleWare ,async function(req,res){
    const userId = req.userId
    const purchases = await Purchase.find({userId}).populate("courseId")
    res.json({
        userId,purchases
    })
    })
module.exports = {
    userRouter:userRouter
}