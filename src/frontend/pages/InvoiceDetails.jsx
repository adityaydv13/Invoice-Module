import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentModal from "../components/PaymentModel.jsx";
import "../styles.css";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/invoices/${id}`,
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching invoice:", err);
      if (err.response && err.response.status === 404) {
        setError("No invoice found with this ID");
      } else {
        setError("Failed to load invoice. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Loading Invoice...</div>;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>❌ {error}</h2>
          <p>Please check the invoice ID and try again.</p>
          <button className="primary-btn" onClick={() => navigate("/")}>
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <div className="loading">Loading Invoice...</div>;

  const { invoice, lines, payments } = data;

  // Currency formatter
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  return (
    <div className="page">
      <div className="invoice-card">
        {/* ==== HEADER ===== */}
        <div className="header">
          <div>
            <h1>Invoice #{invoice.invoiceNumber}</h1>
            <p className="customer-name">{invoice.customerName}</p>
          </div>

          <span className={`status ${invoice.status.toLowerCase()}`}>
            {invoice.status}
          </span>
        </div>

        {/* ==== DATES ==== */}
        <div className="dates">
          <div>
            <span>Issue Date</span>
            <p>{new Date(invoice.issueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span>Due Date</span>
            <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* ==== LINE ITEMS ==== */}
        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line._id}>
                  <td>{line.description}</td>
                  <td>{line.quantity}</td>
                  <td>{formatCurrency(line.unitPrice)}</td>
                  <td>{formatCurrency(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ==== TOTALS ==== */}
        <div className="totals">
          <div>
            <span>Total</span>
            <p>{formatCurrency(invoice.total)}</p>
          </div>
          <div>
            <span>Paid</span>
            <p className="paid">{formatCurrency(invoice.amountPaid)}</p>
          </div>
          <div>
            <span>Balance</span>
            <p className="balance">{formatCurrency(invoice.balanceDue)}</p>
          </div>
        </div>

        {/* ==== PAYMENTS ==== */}
        <div className="payments">
          <div className="payments-header">
            <h3>Payments</h3>
            <button
              className="primary-btn"
              onClick={() => setShowModal(true)}
              disabled={
                invoice.balanceDue !== undefined && invoice.balanceDue <= 0
              }
              title={
                invoice.balanceDue !== undefined && invoice.balanceDue <= 0
                  ? "Invoice is fully paid"
                  : "Add a new payment"
              }
            >
              + Add Payment
            </button>
          </div>

          <div className="payment-list">
            {payments.length === 0 ? (
              <div className="no-payments">No payments yet</div>
            ) : (
              payments.map((p) => (
                <div key={p._id} className="payment-item">
                  <span className="payment-date">
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </span>
                  <span className="payment-amount">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==== PAYMENT MODAL ==== */}
      {showModal && (
        <PaymentModal
          id={id}
          balance={invoice.balanceDue}
          close={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
