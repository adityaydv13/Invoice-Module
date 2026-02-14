import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/AddInvoice.css";

export default function AddInvoice() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    invoiceNumber: "",
    customerName: "",
    status: "Pending",
    issueDate: "",
    dueDate: "",
  });

  const [lines, setLines] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to create an invoice");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return lines.reduce((sum, line) => {
      const lineTotal =
        (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
      return sum + lineTotal;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one line has content
    const validLines = lines.filter((line) => line.description.trim() !== "");
    if (validLines.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            lines: validLines,
          }),
        },
      );
      if (res.ok) {
        alert("Invoice added!");
        navigate("/");
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to add invoice"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error adding invoice");
    }
  };

  return (
    <div className="add-container">
      <div className="form-card">
        <h1>Add New Invoice</h1>
        <form className="invoice-form" onSubmit={handleSubmit}>
          <input
            name="invoiceNumber"
            placeholder="Invoice Number"
            value={form.invoiceNumber}
            onChange={handleChange}
            required
          />
          <input
            name="customerName"
            placeholder="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            required
          />

          <div className="date-row">
            <div className="date-field">
              <label>Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="date-field">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>

          <div className="line-items-section">
            <h3>Line Items</h3>
            {lines.map((line, index) => (
              <div key={index} className="line-item">
                <input
                  type="text"
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) =>
                    handleLineChange(index, "description", e.target.value)
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={line.quantity}
                  onChange={(e) =>
                    handleLineChange(index, "quantity", e.target.value)
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  min="0"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) =>
                    handleLineChange(index, "unitPrice", e.target.value)
                  }
                  required
                />
                <span className="line-total">
                  ₹
                  {(
                    (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0)
                  ).toFixed(2)}
                </span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    className="remove-line-btn"
                    onClick={() => removeLine(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-line-btn" onClick={addLine}>
              + Add Line Item
            </button>
          </div>

          <div className="invoice-total">
            <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
          </div>

          <button type="submit" className="submit-btn">
            Create Invoice
          </button>
        </form>
      </div>
    </div>
  );
}
