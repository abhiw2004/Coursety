const express = require("express")
const courseRouter = express.Router()
const {Purchase, Course} = require("../db")
const {userMiddleWare} = require("../middleware/user")
const { adminMiddleWare } = require("../middleware/admin");
    courseRouter.post("/purchase",userMiddleWare ,async function(req,res){
        const userId = req.userId
        const { courseId } = req.body
        if(!courseId) return res.status(400).json({ message: "courseId required" })
        const course = await Course.findById(courseId)
        if(!course) return res.status(404).json({ message: "Course not found" })
        const existing = await Purchase.findOne({ userId, courseId })
        if(existing) return res.status(400).json({ message: "Already purchased" })
        await Purchase.create({userId, courseId}) 
        res.json({
            message : "You have succesfully bought the course"
        })
    })
    courseRouter.get("/preview", async function(req,res){
        const courses = await Course.find({})
        res.json({
            courses
        })
    })
courseRouter.get("/:id", async function(req,res){
        const { id } = req.params
        const course = await Course.findById(id)
        if(!course){
            return res.status(404).json({ message: "Course not found" })
        }
        res.json({ course })
    })
    

module.exports = {
  courseRouter : courseRouter
}