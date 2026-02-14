import express from "express";
import { getInvoiceDetails, addPayment, createInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/:id", getInvoiceDetails);
router.post("/", createInvoice);
router.post("/:id/payments", addPayment);

export default router;
