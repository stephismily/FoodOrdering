import { Router } from "express";
import mongoose from "mongoose";
import Food from "../models/Food.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();
const validId = (id) => mongoose.isValidObjectId(id);
const cleanFood = (body) => ({
  name: String(body.name || "").trim(),
  description: String(body.description || "").trim(),
  category: String(body.category || "").trim(),
  price: Number(body.price),
  image: String(body.image || "").trim(),
  available: body.available === undefined ? true : Boolean(body.available)
});

router.get("/", async (_req, res, next) => {
  try { res.json(await Food.find().sort({ createdAt: -1 }).lean()); } catch (e) { next(e); }
});
router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid food ID." });
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json(food);
  } catch (e) { next(e); }
});
router.post("/", adminAuth, async (req, res, next) => {
  try {
    const data = cleanFood(req.body);
    if (!data.name || !data.category || !Number.isFinite(data.price) || data.price < 0)
      return res.status(400).json({ message: "Name, category, and a valid non-negative price are required." });
    res.status(201).json(await Food.create(data));
  } catch (e) { next(e); }
});
router.put("/:id", adminAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid food ID." });
    const data = cleanFood(req.body);
    if (!data.name || !data.category || !Number.isFinite(data.price) || data.price < 0)
      return res.status(400).json({ message: "Name, category, and a valid non-negative price are required." });
    const food = await Food.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json(food);
  } catch (e) { next(e); }
});
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid food ID." });
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food item not found." });
    res.json({ message: "Food item deleted." });
  } catch (e) { next(e); }
});
export default router;
