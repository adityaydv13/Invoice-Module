import mongoose from "mongoose";

const InvoiceLineSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
});

export default mongoose.model("InvoiceLine", InvoiceLineSchema);
