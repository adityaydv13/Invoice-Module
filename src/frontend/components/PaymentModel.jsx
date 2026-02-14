import { useState } from "react";
import axios from "axios";
import "../styles.css";

export default function PaymentModal({ id, close, balance }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(""); // optional: default to today
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const numericAmount = Number(amount);

    // Check if invoice is already fully paid
    if (balance <= 0) {
      setError("This invoice is already fully paid. No payment needed.");
      setLoading(false);
      return;
    }

    // Basic validation
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid payment amount.");
      setLoading(false);
      return;
    }

    // Overpayment check
    if (numericAmount > balance) {
      setError(
        `Payment cannot exceed the remaining balance of ₹${balance.toFixed(2)}`,
      );
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/invoices/${id}/payments`,
        {
          amount: numericAmount,
          paymentDate: date ? new Date(date) : new Date(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAmount("");
      setDate("");
      close(); // close modal and refresh parent
    } catch (err) {
      console.error("Payment Error:", err.response || err);
      const message =
        err.response?.data?.message ||
        "Failed to add payment. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <h2>Add Payment</h2>
          <button className="close-btn" onClick={close}>
            &times;
          </button>
        </div>

        {/* Balance Info */}
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>
          Current Balance: ₹{balance}
        </p>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <label>
            Payment Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
