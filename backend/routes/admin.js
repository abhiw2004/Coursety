const express = require("express")
require("dotenv").config()
const adminRouter = express.Router();
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const zod = require("zod");
const {adminMiddleWare} = require("../middleware/admin")
const { Admin } = require("../db");
const {Course} = require("../db")
adminRouter.post("/signup", async function(req,res){
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            message  : "Enter email or password"
        })
    }
    const existingUser = await Admin.findOne({email})
    if(existingUser){
        return res.status(409).json({
          message: "User already exists",
        });
    }
    //hash password
    const hashedPassword =await bcrypt.hash(password,10)
    //save user
    const admin  = await Admin.create({email,password : hashedPassword})
    //token providing
    const token  = jwt.sign({adminId : admin._id},process.env.ADMIN_JWT_SECRET)
    res.json({
        message : "Signup succesful"
    })
})
adminRouter.post("/signin", async function(req,res){
    const {email,password} = req.body;
            const admin = await Admin.findOne({email})
            if(!admin){
               return res.status(404).json({
                    message:"Email or password incorrect"
                })
            }
            const isPasswordCorrect = await bcrypt.compare(password,admin.password)
            if(!isPasswordCorrect){
                 return res.status(404).json({
                    msg:"Email or password incorrect"
                })
            }
            const token = jwt.sign({adminId:admin._id},process.env.ADMIN_JWT_SECRET)
            res.json({
                token : token
            })
})
adminRouter.post("/course", adminMiddleWare, async function (req, res) {
  const creatorId = req.adminId;
  const { title, description, price, imageUrl } = req.body;
  const course = await Course.create({
    creatorId,
    title,
    description,
    price,
    imageUrl,
  });
  res.json({
    message: "Course created",
    courseId: course._id,
  });
});
adminRouter.put("/course", adminMiddleWare, async function (req, res) {
  const adminId = req.adminId;
  const { title, description, imageUrl, price, courseId } = req.body;
  const course = await Course.findOneAndUpdate(
    { _id: courseId, creatorId: adminId },
    { title, description, imageUrl, price },
    { new: true }
  );
  if(!course) return res.status(404).json({ message: "Course not found" })
  res.json({ message: "Course updated", courseId: course._id })
});
adminRouter.get("/course/bulk", adminMiddleWare, async function (req, res) {
  const creatorId = req.adminId;
  const courses = await Course.find({ creatorId });
  res.json({
    courses,
  });
});

module.exports = {
    adminRouter
}