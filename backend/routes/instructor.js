const express = require("express");
const mongoose = require("mongoose");
const { z } = require("zod");
const { Course, InstructorRequest, User } = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const instructorRouter = express.Router();

const requestSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

const courseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.number().nonnegative().max(100000),
  imageUrl: z.string().trim().max(2000).optional().default(""),
  published: z.boolean().optional(),
});

const courseUpdateSchema = courseSchema.partial();

const lessonSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  videoUrl: z.string().trim().max(2000).optional().default(""),
  duration: z.number().nonnegative().max(10000).optional().default(0),
  order: z.number().int().nonnegative().optional().default(0),
  isPreview: z.boolean().optional().default(false),
});

const sectionSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  order: z.number().int().nonnegative().optional().default(0),
  lessons: z.array(lessonSchema).optional().default([]),
});

const curriculumSchema = z.object({
  sections: z.array(sectionSchema).max(50),
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

instructorRouter.post("/request", authRequired, async (req, res, next) => {
  try {
    const parsed = requestSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    if (req.user.role === "instructor" || req.user.role === "admin") {
      return res.status(400).json({ message: "You already have instructor access" });
    }

    const existing = await InstructorRequest.findOne({
      userId: req.user.id,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({ message: "You already have a pending request" });
    }

    const request = await InstructorRequest.create({
      userId: req.user.id,
      reason: parsed.data.reason || "",
      status: "pending",
    });

    return res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
});

instructorRouter.get("/request", authRequired, async (req, res, next) => {
  try {
    const request = await InstructorRequest.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ request });
  } catch (err) {
    next(err);
  }
});

instructorRouter.get(
  "/courses",
  authRequired,
  requireRole("instructor", "admin"),
  async (req, res, next) => {
    try {
      const courses = await Course.find({ creatorId: req.user.id }).sort({ createdAt: -1 });
      return res.json({ courses });
    } catch (err) {
      next(err);
    }
  }
);

instructorRouter.post(
  "/courses",
  authRequired,
  requireRole("instructor", "admin"),
  async (req, res, next) => {
    try {
      const parsed = courseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
      }
      const course = await Course.create({
        ...parsed.data,
        creatorId: req.user.id,
        published: parsed.data.published ?? false,
      });
      return res.status(201).json({ course });
    } catch (err) {
      next(err);
    }
  }
);

instructorRouter.put(
  "/courses/:id/curriculum",
  authRequired,
  requireRole("instructor", "admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid course id" });

      const parsed = curriculumSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid curriculum", issues: parsed.error.issues });
      }

      const filter = { _id: id };
      if (req.user.role !== "admin") filter.creatorId = req.user.id;

      const sections = parsed.data.sections.map((section, sIdx) => ({
        title: section.title,
        order: section.order ?? sIdx,
        lessons: (section.lessons || []).map((lesson, lIdx) => ({
          title: lesson.title,
          description: lesson.description || "",
          videoUrl: lesson.videoUrl || "",
          duration: lesson.duration ?? 0,
          order: lesson.order ?? lIdx,
          isPreview: lesson.isPreview ?? false,
        })),
      }));

      const course = await Course.findOneAndUpdate(filter, { sections }, { new: true });
      if (!course) return res.status(404).json({ message: "Course not found" });
      return res.json({ course });
    } catch (err) {
      next(err);
    }
  }
);

instructorRouter.put(
  "/courses/:id",
  authRequired,
  requireRole("instructor", "admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid course id" });

      const parsed = courseUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
      }

      const filter = { _id: id };
      if (req.user.role !== "admin") filter.creatorId = req.user.id;

      const course = await Course.findOneAndUpdate(filter, parsed.data, { new: true });
      if (!course) return res.status(404).json({ message: "Course not found" });
      return res.json({ course });
    } catch (err) {
      next(err);
    }
  }
);

instructorRouter.delete(
  "/courses/:id",
  authRequired,
  requireRole("instructor", "admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid course id" });

      const filter = { _id: id };
      if (req.user.role !== "admin") filter.creatorId = req.user.id;

      const course = await Course.findOneAndDelete(filter);
      if (!course) return res.status(404).json({ message: "Course not found" });
      return res.json({ message: "Course deleted" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = { instructorRouter };

// Touch User to ensure model is registered (helpful for ref population in admin route)
void User;
