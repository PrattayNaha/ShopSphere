import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useLocation } from "react-router-dom";

import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../styles/payment.css";

const stripePromise = loadStripe(
  "pk_test_51SfNlmC8Gy9IkWj4B7L2GviV2Xit1WLb697qXwYMrrnMD4DYwkwr07omikeypAsOPgLk7BriUu62obNEAAn1d8k900wTvJkTsH"
);

/* ================= STRIPE MODAL ================= */

const StripePaymentModal = ({ total, onClose, address }) => {
  const stripe = useStripe();
  const elements = useElements();
  

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); 
  // null | processing | success | failed

  const handleStripePay = async () => {
  if (!stripe || !elements) return;

  setLoading(true);

  const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("CardElement not found");
      setPaymentStatus("failed");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Create order
      const orderRes = await api.post("checkout/", { payment_method: "STRIPE", address: address });
      const orderId = orderRes.data.order_id;

      // 2️⃣ Create payment intent
      const { data } = await api.post("payments/create-intent/", { order_id: orderId });

      // 3️⃣ Confirm card
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        console.error("Stripe confirm error:", result.error);
        setPaymentStatus("failed");
        setLoading(false);
        return;
      }

      console.log("PaymentIntent:", result.paymentIntent);

      setPaymentStatus("processing"); // now show spinner

      // 4️⃣ Poll backend for order confirmation
      const maxAttempts = 5;
      let attempts = 0;
      let success = false;

      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await api.get(`/orders/${orderId}/status/`);

        if (statusRes.data.status === "PAID") {
          success = true;
          break;
        } else if (
          statusRes.data.status === "CANCELLED" ||
          statusRes.data.status === "FAILED"
        ) {
          break;
        }

        attempts++;
      }

      setPaymentStatus(success ? "success" : "failed");
    } catch (err) {
      console.error("Stripe payment catch:", err);
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div
        className="payment-modal stripe-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= PROCESSING ================= */}
        {paymentStatus === "processing" && (
          <div className="payment-status-box">
            <div className="spinner"></div>
            <h3>Confirming Payment...</h3>
            <p>Please wait while we verify your payment.</p>
          </div>
        )}

        {/* ================= SUCCESS ================= */}
        {paymentStatus === "success" && (
          <div className="payment-status-box success">
            <button
              className="modal-close"
              onClick={() => (window.location.href = "/orders")}
            >
              ×
            </button>
            <h3>Payment Successful 🎉</h3>
            <p>Your order has been confirmed.</p>
          </div>
        )}

        {/* ================= FAILED ================= */}
        {paymentStatus === "failed" && (
          <div className="payment-status-box failed">
            <button
              className="modal-close"
              onClick={() => setPaymentStatus(null)}
            >
              ×
            </button>
            <h3>Payment Failed ❌</h3>
            <p>Something went wrong. Please try again.</p>
          </div>
        )}

        {/* ================= CARD FORM ================= */}
        {!paymentStatus && (
          <>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>

            <h3 className="stripe-title">Pay with Stripe</h3>
            <p className="stripe-subtitle">
              Enter your card details below to complete the payment
            </p>

            <div className="stripe-card-wrapper">
              <CardElement className="card-element" />
            </div>

            <button
              className="pay-btn"
              onClick={handleStripePay}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ৳${total}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ================= PAYMENT PAGE ================= */

const PaymentPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showStripeModal, setShowStripeModal] = useState(false);

  const location = useLocation();
  const checkoutData = location.state;

  const placeOrderCOD = async () => {
    try {
      await api.post("/checkout/", { payment_method: "COD", address: checkoutData.address, grandTotal: checkoutData.grandTotal });
      window.location.href = "/orders";
    } catch (err) {
      console.error(err);
    }
  };

  if (!checkoutData) {
    return (
      <p style={{ padding: 40 }}>
        No checkout data found. Please return to cart.
      </p>
    );
  }

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="payment-page">
        <div className="payment-container">
          <div className="order-summary">
            <h2>Order Summary</h2>

            {checkoutData.cartItems.map((item) => (
              <div className="summary-item" key={item.id}>
                <span>{item.product_name}</span>
                <span>
                  {item.quantity} × ৳{item.price}
                </span>
              </div>
            ))}

            <div className="summary-total2">
              <strong>Total:</strong>
              <strong>৳{checkoutData.grandTotal}</strong>
            </div>
          </div>

          <div className="payment-method">
            <h2>Payment Method</h2>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              Cash on Delivery
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "STRIPE"}
                onChange={() => setPaymentMethod("STRIPE")}
              />
              Pay with Stripe
            </label>

            {paymentMethod === "COD" && (
              <button className="pay-btn" onClick={placeOrderCOD}>
                Place Order
              </button>
            )}

            {paymentMethod === "STRIPE" && (
              <button
                className="pay-btn"
                onClick={() => setShowStripeModal(true)}
              >
                Continue to Stripe
              </button>
            )}
          </div>
        </div>
      </main>

      {showStripeModal && (
        <Elements stripe={stripePromise}>
          <StripePaymentModal
            total={checkoutData.grandTotal}
            address = {checkoutData.address}
            onClose={() => setShowStripeModal(false)}
          />
        </Elements>
      )}

      <Footer />
    </>
  );
};

export default PaymentPage;
