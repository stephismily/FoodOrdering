import { Router } from "express";
import jwt from "jsonwebtoken";
import { adminAuth } from "../middleware/adminAuth.js";

const router = Router();
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/"
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ message: "Admin authentication is not configured." });
  }
  if (email !== (process.env.ADMIN_EMAIL || "admin@example.com") || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.cookie("adminToken", token, cookieOptions());
  res.json({ email, message: "Logged in." });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });
  res.json({ message: "Logged out." });
});

router.get("/me", adminAuth, (req, res) => res.json({ email: req.admin.email }));
export default router;
