import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "../../styles/vendorOrderDetails.css";

const BASE_URL = "http://localhost:8000";

const VendorOrderDetails = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [updating, setUpdating] = useState(false);


  const { orderId } = useParams();

  const fetchOrderDetails = async () => {
    try{
      const res = await api.get(`/vendor/orders/${orderId}/`);
      console.log("Order Details:", res.data);
      setOrder(res.data);
      setDeliveryStatus(res.data.delivery_status)
    } catch(err){
      console.error("Fetch Order Details Error:", err);
    } finally {
      setLoading(false);
    }
  };


  const updateDeliveryStatus = async () => {
    try {
      setUpdating(true);

      const res = await api.patch(
        `/vendor/orders/${orderId}/update-status/`,
        { delivery_status: deliveryStatus }
      );

      console.log("Updated:", res.data);

      // update UI instantly
      setOrder((prev) => ({
        ...prev,
        delivery_status: deliveryStatus,
      }));

    } catch (err) {
      console.error("Update delivery status error:", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <p style={{ padding: 40 }}>Loading order...</p>;
  if (!order) return <p style={{ padding: 40 }}>Order not found</p>;

  return (
      <main className="order-details-page">
        <div className="order-details-container">
          <h2>Order Details</h2>

          {/* ORDER HEADER */}
          <div className="order-header-card">
            <div>
              <strong>Order #{order.id}</strong>
              <p>Status: <span className="status">{order.status}</span></p>
              <p className="order-date">
                Placed on{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="delivery-control">
              <select
                value={deliveryStatus || ""}
                onChange={(e) => setDeliveryStatus(e.target.value)}
              >
                <option value="PLACED">Placed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="RETURNED">Cancalled</option>
              </select>

              <button
                className="update-btn"
                onClick={updateDeliveryStatus}
                disabled={updating}
              >
                {updating ? "Updating..." : "Update"}
              </button>
            </div>

            {/* CURRENT STATUS DISPLAY */}
            <p className="current-status">
              Current Delevery Status: <strong>{order.delivery_status}</strong>
            </p>
            <span className="badge completed">{order.status}</span>
          </div>


          {/* ITEMS */}
          <div className="order-card">
            <div className="card-title">Package</div>

            {order.items.map((item) => (
              <div key={item.id} className="order-item-row">
                <img
                    src={
                      item.product_image
                        ? `${BASE_URL}${item.product_image}`
                        : "https://via.placeholder.com/80"
                    }
                    alt={item.product_name}
                />

                <div className="item-info">
                  <p className="item-name">{item.product_name}</p>
                  {item.variant && (
                    <div className="variant-box23">
                      {item.variant.options.map((opt) => (
                        <span key={opt.id} className="variant-badge23">
                          {opt.value}
                        </span>
                      ))}
                    </div>
                  )}
                  <span>৳ {item.price}</span>
                </div>

                <div className="item-qty">Qty: {item.quantity}</div>
              </div>
            ))}
          </div>

          {/* INFO GRID */}
          <div className="order-info-grid">
            {/* SHIPPING */}
            {order.shipping_address ? (
                <div className="order-card">
                  <p className="card-title">Customer Information</p>
                  <strong>{order.customer_name}</strong>
                  <p>{order.customer_email}</p>
                  <p>📞 {order.shipping_phone}</p>
                  <p>
                    {order.shipping_address}, {order.shipping_city}{" "}
                    {order.shipping_postal_code}
                  </p>
                </div>
              ) : (
                <p>No address found. Please add one.</p>
            )}

            {/* SUMMARY */}
            <div className="order-card">
              <div className="card-title">Total Summary</div>

              <div className="summary-row">
                <span>Subtotal ({order.total_quantity} items)</span>
                <span>৳ {order.total_price}</span>
              </div>

              <div className="summary-row">
                <span>Shipping Fee</span>
                <span>৳ 120</span>
              </div>

              <div className="summary-row">
                <span>COD Handling Fee</span>
                <span>৳ 12</span>
              </div>

              <hr />

              <div className="summary-total">
                <span>Total</span>
                <strong>৳ {order.grand_total}</strong>
              </div>

              <p className="sumary-totla">
                Payment Method: {(order.payment_method)==="STRIPE" ? "Stripe" : "Cash on Delivery"}
              </p>
            </div>
          </div>
        </div>
      </main>
  );
};

export default VendorOrderDetails;
