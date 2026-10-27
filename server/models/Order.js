import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  notes: { type: String, default: "", maxlength: 500 },
  items: [{
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
