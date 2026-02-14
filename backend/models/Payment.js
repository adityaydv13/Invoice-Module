import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", PaymentSchema);
