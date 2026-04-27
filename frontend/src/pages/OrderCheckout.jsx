import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../styles/orderCheckout.css";
import { CartContext } from "../components/CartContext";

const BASE_URL = "http://localhost:8000";

/* ================= ADDRESS MODAL ================= */

const AddressModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Edit Address</h3>

        <input
          type="text"
          value={form.phone_number || ""}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          placeholder="Phone Number"
        />

        <input
          type="text"
          value={form.address_line || ""}
          onChange={(e) => setForm({ ...form, address_line: e.target.value })}
          placeholder="Address Line"
        />

        <input
          type="text"
          value={form.city || ""}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City"
        />

        <input
          type="text"
          value={form.postal_code || ""}
          onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          placeholder="Postal Code"
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
};

const OrderCheckout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState(null);


  const navigate = useNavigate();
  const { fetchCartCount, resetCartCount } = useContext(CartContext);

  /* ---------------- FETCH DATA ---------------- */

  const fetchCheckoutData = async () => {
    try {
      const [cartRes, profileRes] = await Promise.all([
        api.get("/cart/"),
        api.get("/profile/"),
      ]);

      setCartItems(cartRes.data.items || []);
      setProfile(profileRes.data);
    } catch (err) {
      console.error("Checkout load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  /* ---------------- CALCULATIONS ---------------- */

  const itemsTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = cartItems.length > 0 ? 132 : 0;
  const grandTotal = itemsTotal + deliveryFee;


  const defaultAddress =
    profile?.addresses?.find((a) => a.is_default) ||
    profile?.addresses?.[0];

  /* ---------------- PLACE ORDER ---------------- */

  const activeAddress = tempAddress || defaultAddress;

  const ProceedtoPay = async () => {
    try {
      setPlacingOrder(true);
      await fetchCartCount(); // update cart count in context
      navigate("/payment", {state:{cartItems, itemsTotal, deliveryFee, grandTotal, address:activeAddress}}); // order history page
    } catch (err) {
      alert("Failed to place order");
      console.error(err);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading checkout...</p>;

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="checkout-page">
        <div className="checkout-container">
          {/* LEFT */}
          <div className="checkout-left">
            {/* SHIPPING */}
            <div className="checkout-card">
              <div className="card-header">
                <h3>Shipping & Billing</h3>
                <button className="edit-btn" onClick={() => setShowAddressModal(true)}>
                  Edit Address
                </button>
              </div>
              {activeAddress ? (
                <div className="address-box">
                  <strong>{profile.username}</strong>
                  <p>📞 {activeAddress.phone_number}</p>
                  <span className="tag">
                    {activeAddress.label.toUpperCase()}
                  </span>
                  <p>
                    {activeAddress.address_line}, {activeAddress.city}{" "}
                    {activeAddress.postal_code}
                  </p>
                </div>
              ) : (
                <p>No address found. Please add one.</p>
              )}
            </div>

            {/* DELIVERY */}
            <div className="checkout-card">
              <h3>Delivery Method</h3>
              <div className="delivery-option active">
                <span>Standard Delivery</span>
                <strong>৳ {deliveryFee}</strong>
                <p>Guaranteed in 3–5 days</p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="checkout-card">
              <h3>Order Items</h3>

              {cartItems.map((item) => (
                <div className="product-row" key={item.id}>
                  <img
                    src={
                      item.product_image
                        ? `${BASE_URL}${item.product_image}`
                        : "https://via.placeholder.com/80"
                    }
                    alt={item.product_name}
                  />

                  <div className="product-info">
                    <p className="product-title">{item.product_name}</p>
                    {item.variant && item.variant.options?.length > 0 && (
                      <div className="checkout-variant">
                        {item.variant.options.map((opt) => (
                          <span key={opt.id} className="variant-badge">
                            {opt.value}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="price">
                      ৳ {item.price} × {item.quantity}
                    </span>
                  </div>

                  <span className="qty">
                    ৳ {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="checkout-right">
            <div className="checkout-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Items Total</span>
                <span>৳ {itemsTotal}</span>
              </div>

              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>৳ {deliveryFee}</span>
              </div>
              <hr/>
              <div className="summary-total1">
                <span>Total</span>
                <strong>৳ {grandTotal}</strong>
              </div>
              <button
                className="pay-btn"
                disabled={placingOrder || cartItems.length === 0}
                onClick={ProceedtoPay}
              >
                {placingOrder ? "Proceeding..." : "Proceed To Pay"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showAddressModal && (
        <AddressModal
          initial={{
            phone_number: activeAddress?.phone_number || "",
            address_line: activeAddress?.address_line || "",
            city: activeAddress?.city || "",
            postal_code: activeAddress?.postal_code || "",
            label: activeAddress?.label || "Home",
          }}
          onSave={(data) => {
            setTempAddress(data);
            setShowAddressModal(false);
          }}
          onClose={() => setShowAddressModal(false)}
        />
      )}
      <Footer />
    </>
  );
};

export default OrderCheckout;
