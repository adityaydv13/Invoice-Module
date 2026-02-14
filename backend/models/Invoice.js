import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue"],
    default: "Pending",
  },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  total: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
});

export default mongoose.model("Invoice", InvoiceSchema);
