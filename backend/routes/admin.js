const express = require("express");
const mongoose = require("mongoose");
const { z } = require("zod");
const { User, InstructorRequest, Course } = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const adminRouter = express.Router();

adminRouter.use(authRequired, requireRole("admin"));

const roleSchema = z.object({
  role: z.enum(["learner", "instructor", "admin"]),
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

adminRouter.get("/instructor-requests", async (req, res, next) => {
  try {
    const status = req.query.status && ["pending", "approved", "rejected"].includes(req.query.status)
      ? req.query.status
      : "pending";
    const requests = await InstructorRequest.find({ status })
      .sort({ createdAt: -1 })
      .populate("userId", "email firstName lastName role");
    return res.json({ requests });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/instructor-requests/:id/approve", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const request = await InstructorRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    const user = await User.findById(request.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "learner") user.role = "instructor";
    await user.save();

    request.status = "approved";
    request.decidedBy = req.user.id;
    request.decidedAt = new Date();
    await request.save();

    return res.json({ request, user: { id: user._id, role: user.role } });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/instructor-requests/:id/reject", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const request = await InstructorRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = "rejected";
    request.decidedBy = req.user.id;
    request.decidedAt = new Date();
    await request.save();

    return res.json({ request });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find({}, "-passwordHash").sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/users/:id/role", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid role" });

    if (id === req.user.id && parsed.data.role !== "admin") {
      return res.status(400).json({ message: "You cannot demote yourself" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: parsed.data.role },
      { new: true, projection: "-passwordHash" }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/courses", async (_req, res, next) => {
  try {
    const courses = await Course.find({})
      .sort({ createdAt: -1 })
      .populate("creatorId", "email firstName lastName role");
    return res.json({ courses });
  } catch (err) {
    next(err);
  }
});

module.exports = { adminRouter };
