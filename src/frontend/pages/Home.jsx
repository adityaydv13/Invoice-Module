 
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styling/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [latestInvoiceId, setLatestInvoiceId] = useState("");

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

     
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/invoices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);

        // Find the latest invoice (most recently created)
        if (data && data.length > 0) {
          // Sort by _id (MongoDB ObjectId contains timestamp) or by creation date
          const sortedInvoices = [...data].sort((a, b) => {
            // Compare by _id (newer ObjectIds are larger)
            return b._id.localeCompare(a._id);
          });
          setLatestInvoiceId(sortedInvoices[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <div className="header">
        <h1 className="main-heading">Basic Simple Invoice Module</h1>
        <button className="btn logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="top-controls">
        <div className="get-invoice">
          <input
            type="text"
            placeholder="Enter Invoice ID"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            required
          />
          <Link className="btn view-btn" to={`/invoice/${invoiceId}`}>
            Get Invoice
          </Link>
          {latestInvoiceId && (
            <span className="demo-id" title="Click to copy">
              Latest:{" "}
              <span
                className="demo-id-value"
                onClick={() => {
                  navigator.clipboard.writeText(latestInvoiceId);
                  alert("Invoice ID copied to clipboard!");
                }}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {latestInvoiceId}
              </span>
            </span>
          )}
        </div>

        <div className="add-invoice">
          <Link className="btn add-btn" to="/add-invoice">
            Add New Invoice
          </Link>
        </div>
      </div>

      {invoices.length === 0 ? (
        <p>No invoices available.</p>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.customerName}</td>
                <td>
                  <span className={`status ${inv.status.toLowerCase()}`}>
                    {inv.status}
                  </span>
                </td>
                <td>{inv.issueDate}</td>
                <td>{inv.dueDate}</td>
                <td>
                  <Link className="view-link" to={`/invoice/${inv._id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
