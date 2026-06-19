const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const { z } = require("zod");
const { Course, Order, Purchase } = require("../db");
const { authRequired } = require("../middleware/auth");

const paymentRouter = express.Router();

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

paymentRouter.post("/create-order", authRequired, async (req, res, next) => {
  try {
    const { courseId } = req.body || {};
    if (!courseId || !isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ message: "Payment gateway is not configured" });
    }

    const course = await Course.findById(courseId);
    if (!course || !course.published) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.price <= 0) {
      return res.status(400).json({ message: "This course is free. Use enroll instead." });
    }

    if (String(course.creatorId) === req.user.id) {
      return res.status(400).json({ message: "You already own this course" });
    }

    const existing = await Purchase.findOne({ userId: req.user.id, courseId });
    if (existing) {
      return res.status(409).json({ message: "Already enrolled" });
    }

    const amountPaise = Math.round(course.price * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `course_${courseId}_${Date.now()}`,
      notes: {
        courseId: String(courseId),
        userId: String(req.user.id),
      },
    });

    const order = await Order.create({
      userId: req.user.id,
      courseId,
      amount: amountPaise,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    });

    return res.status(201).json({
      orderId: razorpayOrder.id,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      courseTitle: course.title,
      dbOrderId: order._id,
    });
  } catch (err) {
    next(err);
  }
});

paymentRouter.post("/verify", authRequired, async (req, res, next) => {
  try {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "paid") {
      return res.json({ message: "Payment already verified", enrolled: true });
    }

    const course = await Course.findById(order.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    try {
      await Purchase.create({
        userId: req.user.id,
        courseId: order.courseId,
        amount: order.amount / 100,
        orderId: order._id,
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.json({ message: "Already enrolled", enrolled: true });
      }
      throw err;
    }

    return res.json({ message: "Payment verified. You are now enrolled!", enrolled: true });
  } catch (err) {
    next(err);
  }
});

module.exports = { paymentRouter };
