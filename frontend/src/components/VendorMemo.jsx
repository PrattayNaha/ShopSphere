import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";
import "../styles/memo.css";
import logo from "../logo/logo.png";

const VendorMemo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const memoRef = useRef();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/vendor/orders/${id}/memo-data/`);
        setOrder(response.data);
      } catch (err) {
        console.error("Fetch Memo Error:", err);
        setError("Failed to load memo.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const downloadPDF = () => {
    if (!memoRef.current) return;

    const opt = {
      margin: [8, 8, 8, 8],
      filename: `Order_${order?.id || id}_Memo.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowWidth: memoRef.current.scrollWidth,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css"] },
    };

    html2pdf().set(opt).from(memoRef.current).save();
  };

  /* helpers */
  const getBadgeClass = (status = "") => {
    const s = status.toLowerCase();
    if (s === "success" || s === "delivered" || s === "completed") return "success";
    if (s === "pending" || s === "processing") return "pending";
    return "failed";
  };

  if (loading) return <div className="memo-wrapper">Loading memo...</div>;
  if (error)   return <div className="memo-wrapper">{error}</div>;
  if (!order)  return <div className="memo-wrapper">No order found.</div>;

  return (
    <div className="memo-wrapper">

      {/* Action buttons */}
      <div className="memo-actions">
        <button className="btn-primary" onClick={downloadPDF}>
          ↓ Download PDF
        </button>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Memo card */}
      <div className="memo-container" ref={memoRef}>

        {/* Accent stripe */}
        <div className="memo-accent" />

        {/* Header */}
        <div className="memo-header">
          <div className="memo-brand">
            <img src={logo} alt="Logo" className="memo-logo" />
            <div>
              <div className="memo-brand-name">ShopSphere</div>
              <div className="memo-brand-tagline">Order Receipt</div>
            </div>
          </div>

          <div className="memo-meta">
            <div className="memo-title">Order Memo</div>
            <span className={`memo-badge ${getBadgeClass(order.status)}`}>
              {order.status}
            </span>
            <div className="memo-meta-row">
              Order <span>#{order.id}</span>
            </div>
            <div className="memo-meta-row">
              Date <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="memo-body">

          {/* Customer info */}
          <div className="memo-section">
            <div className="memo-section-title">Customer Information</div>
            <div className="memo-info-grid">
              <div className="memo-info-item">
                <label>Name</label>
                <p>{order.customer_name || "—"}</p>
              </div>
              <div className="memo-info-item">
                <label>Phone</label>
                <p>{order.phone || "—"}</p>
              </div>
              <div className="memo-info-item">
                <label>Address</label>
                <p>{order.address || "—"}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="memo-section">
            <div className="memo-section-title">Order Items</div>
            <div className="memo-table-wrap">
              <table className="memo-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>৳ {Number(item.price).toLocaleString()}</td>
                      <td>৳ {(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Summary */}
        <div className="memo-summary">
          <div className="memo-summary-box">
            <div className="memo-summary-row">
              <span>Subtotal</span>
              <span className="val">৳ {Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="memo-summary-row">
              <span>Shipping</span>
              <span className="val">৳ {Number("120").toLocaleString()}</span>
            </div>
            <div className="memo-summary-row">
              <span>COD Fee</span>
              <span className="val">৳ {Number("12").toLocaleString()}</span>
            </div>
            <hr className="memo-summary-divider" />
            <div className="memo-summary-total">
              <span className="label">Total</span>
              <span className="val">৳ {Number(order.grand_total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="memo-footer">
          Thank you for shopping with ShopSphere · This is a system-generated memo
        </div>

      </div>
    </div>
  );
};

export default VendorMemo;