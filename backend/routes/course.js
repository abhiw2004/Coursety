const express = require("express");
const mongoose = require("mongoose");
const { Course, Purchase } = require("../db");
const { authRequired, optionalAuth } = require("../middleware/auth");

const courseRouter = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function publicCourse(course) {
  return {
    _id: course._id,
    title: course.title,
    description: course.description,
    price: course.price,
    imageUrl: course.imageUrl,
    published: course.published,
    creatorId: course.creatorId,
    createdAt: course.createdAt,
  };
}

courseRouter.get("/", async (_req, res, next) => {
  try {
    const courses = await Course.find({ published: true })
      .sort({ createdAt: -1 })
      .populate("creatorId", "firstName lastName");
    return res.json({ courses });
  } catch (err) {
    next(err);
  }
});

courseRouter.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(404).json({ message: "Course not found" });

    const course = await Course.findById(id).populate("creatorId", "firstName lastName");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = req.user && course.creatorId && String(course.creatorId._id || course.creatorId) === req.user.id;
    const isAdmin = req.user && req.user.role === "admin";

    if (!course.published && !isOwner && !isAdmin) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({ course: publicCourse(course), creator: course.creatorId });
  } catch (err) {
    next(err);
  }
});

courseRouter.post("/:id/enroll", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid course id" });

    const course = await Course.findById(id);
    if (!course || !course.published) return res.status(404).json({ message: "Course not found" });

    if (String(course.creatorId) === req.user.id) {
      return res.status(400).json({ message: "You already own this course" });
    }

    try {
      await Purchase.create({ userId: req.user.id, courseId: id });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ message: "Already enrolled" });
      }
      throw err;
    }

    return res.status(201).json({ message: "Enrolled successfully" });
  } catch (err) {
    next(err);
  }
});

courseRouter.get("/:id/access", authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid course id" });

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = String(course.creatorId) === req.user.id;
    const isAdmin = req.user.role === "admin";
    const purchase = isOwner || isAdmin ? null : await Purchase.findOne({ userId: req.user.id, courseId: id });

    return res.json({ access: Boolean(isOwner || isAdmin || purchase) });
  } catch (err) {
    next(err);
  }
});

courseRouter.get("/me/purchases", authRequired, async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("courseId");
    return res.json({ purchases });
  } catch (err) {
    next(err);
  }
});

module.exports = { courseRouter };
