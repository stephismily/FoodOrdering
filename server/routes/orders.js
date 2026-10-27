import { Router } from "express";
import mongoose from "mongoose";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();
const statuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

router.post("/", async (req, res, next) => {
  try {
    const { customerName, phone, address, notes = "", items } = req.body || {};
    if (!String(customerName || "").trim() || !String(phone || "").trim() || !String(address || "").trim())
      return res.status(400).json({ message: "Name, phone, and delivery address are required." });
    if (!Array.isArray(items) || items.length < 1 || items.length > 50)
      return res.status(400).json({ message: "Add at least one food item." });

    const quantities = new Map();
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.foodId) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 99)
        return res.status(400).json({ message: "Invalid food item or quantity." });
      quantities.set(String(item.foodId), (quantities.get(String(item.foodId)) || 0) + Number(item.quantity));
    }
    const foods = await Food.find({ _id: { $in: [...quantities.keys()] }, available: true });
    if (foods.length !== quantities.size) return res.status(400).json({ message: "One or more items are unavailable. Refresh the menu and try again." });
    const orderItems = foods.map(food => ({
      foodId: food._id, name: food.name, price: food.price, quantity: quantities.get(String(food._id))
    }));
    const total = Number(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    const order = await Order.create({
      customerName: String(customerName).trim(), phone: String(phone).trim(),
      address: String(address).trim(), notes: String(notes).trim(), items: orderItems, total
    });
    res.status(201).json({ id: order._id, total: order.total, status: order.status, message: "Order placed successfully." });
  } catch (e) { next(e); }
});

router.get("/", adminAuth, async (_req, res, next) => {
  try { res.json(await Order.find().sort({ createdAt: -1 }).lean()); } catch (e) { next(e); }
});
router.get("/:id", adminAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID." });
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (e) { next(e); }
});
router.patch("/:id/status", adminAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID." });
    if (!statuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status." });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (e) { next(e); }
});
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID." });
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ message: "Order deleted." });
  } catch (e) { next(e); }
});
export default router;
