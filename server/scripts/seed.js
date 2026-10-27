import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../models/Food.js";
dotenv.config();

const sampleFoods = [
  { name: "Margherita Pizza", category: "Pizza", description: "Classic tomato, mozzarella and basil.", price: 249, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800", available: true },
  { name: "Farmhouse Pizza", category: "Pizza", description: "Bell peppers, onion, mushroom and cheese.", price: 329, image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800", available: true },
  { name: "Classic Burger", category: "Burgers", description: "Juicy patty, lettuce and house sauce.", price: 159, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800", available: true },
  { name: "Crispy Chicken Burger", category: "Burgers", description: "Crispy chicken with fresh vegetables.", price: 219, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800", available: true },
  { name: "Paneer Tikka Bowl", category: "Indian", description: "Tandoori paneer, rice and mint chutney.", price: 229, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800", available: true },
  { name: "Veg Biryani", category: "Indian", description: "Fragrant rice, vegetables and spices.", price: 189, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800", available: true },
  { name: "Hakka Noodles", category: "Chinese", description: "Stir-fried noodles with vegetables.", price: 169, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800", available: true },
  { name: "Veg Fried Rice", category: "Chinese", description: "Wok-tossed rice with vegetables.", price: 159, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800", available: true },
  { name: "Chocolate Brownie", category: "Desserts", description: "Rich chocolate brownie.", price: 99, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800", available: true },
  { name: "Cheesecake Slice", category: "Desserts", description: "Creamy cheesecake with berry topping.", price: 149, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800", available: true },
  { name: "Cold Coffee", category: "Beverages", description: "Chilled coffee with milk.", price: 109, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800", available: true },
  { name: "Fresh Lime Soda", category: "Beverages", description: "Refreshing lime soda.", price: 69, image: "https://images.unsplash.com/photo-1513558161293-caad427b9e13?w=800", available: true }
];

try {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in server/.env first.");
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Food.countDocuments();
  if (count === 0) {
    await Food.insertMany(sampleFoods);
    console.log(`Inserted ${sampleFoods.length} sample food items.`);
  } else {
    console.log(`Foods collection already contains ${count} items; no changes made.`);
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
