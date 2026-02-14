import Invoice from "../models/Invoice.js";
import InvoiceLine from "../models/InvoiceLine.js";
import Payment from "../models/Payment.js";

// GET all invoices (only for logged-in user)
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id }).sort({
      _id: -1,
    });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET invoice details (verify ownership)
export const getInvoiceDetails = async (req, res) => {
  try {
    const id = req.params.id.trim();
    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Verify ownership
    if (invoice.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const lines = await InvoiceLine.find({ invoiceId: id });
    const payments = await Payment.find({ invoiceId: id });

    const total = lines.reduce((acc, item) => acc + item.lineTotal, 0);
    const amountPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const balanceDue = total - amountPaid;

    const status = balanceDue === 0 ? "Paid" : invoice.status;

    res.json({
      invoice: { ...invoice.toObject(), total, amountPaid, balanceDue, status },
      lines,
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST payment (verify ownership)
export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Verify ownership
    if (invoice.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // calculate current balance
    const lines = await InvoiceLine.find({ invoiceId: id });
    const payments = await Payment.find({ invoiceId: id });
    const total = lines.reduce((acc, item) => acc + item.lineTotal, 0);
    const amountPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const balanceDue = total - amountPaid;

    // Validation checks
    if (balanceDue <= 0) {
      return res.status(400).json({
        message: "This invoice is already fully paid. No payment needed.",
      });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Payment amount must be greater than 0" });
    }

    if (amount > balanceDue) {
      return res.status(400).json({
        message: `Payment cannot exceed the remaining balance of ₹${balanceDue.toFixed(2)}`,
      });
    }

    const payment = await Payment.create({
      invoiceId: id,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    });

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add payment" });
  }
};

// POST create invoice (associate with logged-in user)
export const createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, customerName, issueDate, dueDate, status, lines } =
      req.body;

    const invoice = new Invoice({
      userId: req.user.id, // Associate with logged-in user
      invoiceNumber,
      customerName,
      issueDate,
      dueDate,
      status,
    });
    await invoice.save();

    let total = 0;
    if (lines && lines.length) {
      for (const line of lines) {
        const lineTotal = line.quantity * line.unitPrice;
        total += lineTotal;
        await InvoiceLine.create({
          invoiceId: invoice._id,
          ...line,
          lineTotal,
        });
      }
    }

    invoice.total = total;
    invoice.balanceDue = total;
    await invoice.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
};
