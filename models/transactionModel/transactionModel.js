import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: { type: String, default: "INR" },
  status: {
    type: String,
    enum: ["created", "paid", "failed", "cancelled"],
    default: "created",
  },
}, { timestamps: true });

const Transaction= mongoose.model("Transaction", transactionSchema);

export default Transaction;