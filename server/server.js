import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import Food from "./models/Food.js";
import foodRoutes from "./routes/foods.js";
import orderRoutes from "./routes/orders.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const defaultFoods = [
  { name: "Margherita Pizza", category: "Pizza", description: "Classic tomato, mozzarella and basil.", price: 249, image: "", available: true },
  { name: "Farmhouse Pizza", category: "Pizza", description: "Bell peppers, onion, mushroom and cheese.", price: 329, image: "", available: true },
  { name: "Classic Burger", category: "Burgers", description: "Juicy patty, lettuce and house sauce.", price: 159, image: "", available: true },
  { name: "Crispy Chicken Burger", category: "Burgers", description: "Crispy chicken with fresh vegetables.", price: 219, image: "", available: true },
  { name: "Paneer Tikka Bowl", category: "Indian", description: "Tandoori paneer, rice and mint chutney.", price: 229, image: "", available: true },
  { name: "Veg Biryani", category: "Indian", description: "Fragrant rice, vegetables and spices.", price: 189, image: "", available: true },
  { name: "Hakka Noodles", category: "Chinese", description: "Stir-fried noodles with vegetables.", price: 169, image: "", available: true },
  { name: "Veg Fried Rice", category: "Chinese", description: "Wok-tossed rice with vegetables.", price: 159, image: "", available: true },
  { name: "Chocolate Brownie", category: "Desserts", description: "Rich chocolate brownie.", price: 99, image: "", available: true },
  { name: "Cheesecake Slice", category: "Desserts", description: "Creamy cheesecake with berry topping.", price: 149, image: "", available: true },
  { name: "Cold Coffee", category: "Beverages", description: "Chilled coffee with milk.", price: 109, image: "", available: true },
  { name: "Fresh Lime Soda", category: "Beverages", description: "Refreshing lime soda.", price: 69, image: "", available: true }
];

const app = express();
app.set("trust proxy", 1);

const isProductionLike = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.VERCEL === "1";
const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "");
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  "http://localhost:5173",
  "http://localhost:5174"
].flatMap((value) => String(value || "").split(",")).map(normalizeOrigin).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
    if (isProductionLike && /^https:\/\/.*\.vercel\.app$/i.test(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "food-ordering-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Add it to server/.env.");
  process.exit(1);
}

const ensureMenuSeed = async () => {
  const count = await Food.countDocuments();
  if (count === 0) {
    await Food.insertMany(defaultFoods);
    console.log(`Seeded ${defaultFoods.length} default food items.`);
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await ensureMenuSeed();
    app.listen(port, () => console.log(`API running on port ${port}`));
  })
  .catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
