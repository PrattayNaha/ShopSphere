import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../styles/orderDetails.css";

const BASE_URL = "http://localhost:8000";

const OrderDetails = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const { orderId } = useParams();

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get("/orders/");
      const profileRes = await api.get("/profile/");
      setProfile(profileRes.data);
      const found = res.data.find(o => o.id === Number(orderId));
      setOrder(found);
    } catch (err) {
      console.error("Failed to load order details", err);
    } finally {
      setLoading(false);
    }
  };

  const defaultAddress =
    profile?.addresses?.find((a) => a.is_default) ||
    profile?.addresses?.[0];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <p style={{ padding: 40 }}>Loading order...</p>;
  if (!order) return <p style={{ padding: 40 }}>Order not found</p>;

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="order-details-page12">
        <div className="order-details-container">
          <h2>Order Details</h2>

          {/* ORDER HEADER */}
          <div className="order-header-card12">
            <div>
              <strong>Order #{order.id}</strong>

              <p>
                Delivery:{" "}
                <span className={`delivery-badge ${order.delivery_status?.toLowerCase()}`}>
                  {order.delivery_status}
                </span>
              </p>

              <p>Status: <span className="status">{order.status}</span></p>
              <p className="order-date">
                Placed on{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <span className="badge completed12">{order.status}</span>
          </div>

          {/* DELIVERY PROGRESS */}
          <div className="delivery-progress">
          <div
            className={`step ${
              ["PLACED", "SHIPPED", "DELIVERED"].includes(order.delivery_status)
                ? "completed"
                : ""
            }`}
          >
            Placed
          </div>

          <div
            className={`step ${
              ["SHIPPED", "DELIVERED"].includes(order.delivery_status)
                ? "completed"
                : ""
            }`}
          >
            Shipped
          </div>

          <div
            className={`step ${
              order.delivery_status === "DELIVERED" ? "completed" : ""
            }`}
          >
            Delivered
          </div>
        </div>

          {/* ITEMS */}
          <div className="order-card12">
            <div className="card-title12">Package</div>

            {order.items.map((item) => (
              <div key={item.id} className="order-item-row12">
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
                    <div className="variant-box12">
                      {item.variant.options.map((opt) => (
                        <span key={opt.id} className="variant-badge12">
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
          <div className="order-info-grid12">
            {/* SHIPPING */}
            {order.shipping_address ? (
                <div className="order-card12">
                  <strong>{profile.username}</strong>
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
            <div className="order-card12">
              <div className="card-title">Total Summary</div>

              <div className="summary-row12">
                <span>Subtotal ({order.total_quantity} items)</span>
                <span>৳ {order.total_price}</span>
              </div>

              <div className="summary-row12">
                <span>Shipping Fee</span>
                <span>৳ 132</span>
              </div>
              <hr />

              <div className="summary-total12">
                <span>Total</span>
                <strong>৳ {order.grand_total}</strong>
              </div>

              <p className="summary-total12">
                Payment Method: {(order.payment_method)==="STRIPE" ? "Stripe" : "Cash on Delivery"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderDetails;
