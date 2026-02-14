import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import invoiceRoutes from "./routes/InvoiceRoutes.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
app.use(cors()); // allow frontend
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);

app.use("/api/invoices", invoiceRoutes);

app.listen(process.env.PORT || 5000, () => console.log("Server running on port", process.env.PORT || 5000));
