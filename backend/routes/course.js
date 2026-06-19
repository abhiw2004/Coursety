const express = require("express");
const mongoose = require("mongoose");
const { Course, Purchase, LessonProgress } = require("../db");
const { authRequired, optionalAuth } = require("../middleware/auth");
const {
  userHasCourseAccess,
  countLessons,
  sanitizeCurriculum,
  findLesson,
} = require("../utils/access");

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
    lessonCount: countLessons(course),
    sectionCount: (course.sections || []).length,
  };
}

courseRouter.get("/", async (_req, res, next) => {
  try {
    const courses = await Course.find({ published: true })
      .sort({ createdAt: -1 })
      .populate("creatorId", "firstName lastName");
    const withCounts = courses.map((c) => publicCourse(c));
    return res.json({ courses: withCounts });
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

courseRouter.get("/:id/curriculum", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(404).json({ message: "Course not found" });

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = req.user && String(course.creatorId) === req.user.id;
    const isAdmin = req.user && req.user.role === "admin";
    if (!course.published && !isOwner && !isAdmin) {
      return res.status(404).json({ message: "Course not found" });
    }

    const hasAccess = req.user ? await userHasCourseAccess(req.user, course) : false;
    const sections = sanitizeCurriculum(course, hasAccess);

    let completedLessonIds = [];
    if (hasAccess && req.user) {
      const progress = await LessonProgress.find({ userId: req.user.id, courseId: id });
      completedLessonIds = progress.map((p) => String(p.lessonId));
    }

    const totalLessons = countLessons(course);
    const completedCount = completedLessonIds.length;

    return res.json({
      sections,
      hasAccess,
      progress: {
        completed: completedCount,
        total: totalLessons,
        percent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
        completedLessonIds,
      },
    });
  } catch (err) {
    next(err);
  }
});

courseRouter.get("/:id/lessons/:lessonId", authRequired, async (req, res, next) => {
  try {
    const { id, lessonId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(lessonId)) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const found = findLesson(course, lessonId);
    if (!found) return res.status(404).json({ message: "Lesson not found" });

    const { section, lesson } = found;
    const hasAccess = await userHasCourseAccess(req.user, course);
    if (!hasAccess && !lesson.isPreview) {
      return res.status(403).json({ message: "Purchase this course to access this lesson" });
    }

    const progress = await LessonProgress.findOne({
      userId: req.user.id,
      courseId: id,
      lessonId,
    });

    return res.json({
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        isPreview: lesson.isPreview,
        sectionTitle: section.title,
        sectionId: section._id,
      },
      completed: Boolean(progress?.completed),
    });
  } catch (err) {
    next(err);
  }
});

courseRouter.post("/:id/lessons/:lessonId/complete", authRequired, async (req, res, next) => {
  try {
    const { id, lessonId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson id" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const found = findLesson(course, lessonId);
    if (!found) return res.status(404).json({ message: "Lesson not found" });

    const hasAccess = await userHasCourseAccess(req.user, course);
    if (!hasAccess && !found.lesson.isPreview) {
      return res.status(403).json({ message: "No access to this lesson" });
    }

    await LessonProgress.findOneAndUpdate(
      { userId: req.user.id, courseId: id, lessonId },
      { completed: true, completedAt: new Date() },
      { upsert: true, new: true }
    );

    const totalLessons = countLessons(course);
    const completedCount = await LessonProgress.countDocuments({ userId: req.user.id, courseId: id });

    return res.json({
      message: "Lesson marked complete",
      progress: {
        completed: completedCount,
        total: totalLessons,
        percent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
      },
    });
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

    let enrolled = false;
    if (req.user) {
      enrolled = await userHasCourseAccess(req.user, course);
    }

    return res.json({
      course: publicCourse(course),
      creator: course.creatorId,
      enrolled,
    });
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

    if (course.price > 0) {
      return res.status(400).json({ message: "This is a paid course. Please use checkout." });
    }

    if (String(course.creatorId) === req.user.id) {
      return res.status(400).json({ message: "You already own this course" });
    }

    try {
      await Purchase.create({ userId: req.user.id, courseId: id, amount: 0 });
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

    const access = await userHasCourseAccess(req.user, course);
    return res.json({ access });
  } catch (err) {
    next(err);
  }
});

module.exports = { courseRouter };
