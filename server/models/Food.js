import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", maxlength: 500 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  available: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Food", foodSchema);
