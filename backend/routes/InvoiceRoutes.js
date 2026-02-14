import express from "express";
import {
  getAllInvoices,
  getInvoiceDetails,
  addPayment,
  createInvoice,
} from "../controllers/invoiceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllInvoices);
router.get("/:id", authMiddleware, getInvoiceDetails);
router.post("/", authMiddleware, createInvoice);
router.post("/:id/payments", authMiddleware, addPayment);

export default router;
