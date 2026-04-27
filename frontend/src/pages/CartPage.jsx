import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api"; // your axios instance
import { CartContext } from "../components/CartContext";
import "../styles/cart.css";

const CartPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { incrementCart, decrementCart } = useContext(CartContext);

  const navigate = useNavigate();

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/cart/"); // Django CartDetailView
      const BASE_URL = "http://localhost:8000"; // backend URL
      const items = res.data.items.map((item) => ({
        id: item.id,
        productId: item.product,
        title: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image: item.product_image
          ? `${BASE_URL}${item.product_image}`
          : "https://via.placeholder.com/150",
        variant:item.variant,
      }));
      setCartItems(items);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Change quantity
  const handleQuantityChange = async (id, delta) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      await api.patch(`/cart/item/${id}/`, { quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        )
      );

      // Update context badge
      if (delta > 0) incrementCart(delta);
      else decrementCart(Math.abs(delta));
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const { fetchCartCount } = useContext(CartContext);

  // Remove item
  const handleRemoveItem = async (id) => {
    try {
      await api.delete(`/cart/item/${id}/remove/`);
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, removed: true } : i));
      fetchCartCount(); // update badge instantly
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const shippingFee = 132;


  const subtotal = cartItems.reduce(
    (acc, item) => (!item.removed ? acc + item.price * item.quantity : acc),
    0
  );

  if (loading) return <p style={{ padding: "50px" }}>Loading cart...</p>;
  if (error) return <p style={{ padding: "50px", color: "red" }}>{error}</p>;

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="cart-page">
        <div className="cart-container">
          {/* LEFT: Cart Items */}
          <div className="cart-items">
            <h2>
              Shopping Cart ({cartItems.filter(i => !i.removed).length}{" "}
              {cartItems.filter(i => !i.removed).length === 1 ? "Item" : "Items"})
            </h2>

            {cartItems.filter(i => !i.removed).length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty.</p>
                <button
                  className="continue-shopping"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems
                .filter(i => !i.removed)
                .map((item) => (
                  <div key={item.id} className="cart-item">
                    <input type="checkbox" />
                    <img
                      src={item.image}
                      alt={item.title}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <p className="cart-item-title">{item.title}</p>
                      {item.variant && (
                        <div className="cart-item-variant">
                          {item.variant.options.map((opt) => (
                            <span key = {opt.id}  className="variant-badge">
                              {opt.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button onClick={() => handleQuantityChange(item.id, -1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)}>
                            +
                          </button>
                        </div>
                        <p className="cart-item-price">৳ {item.price}</p>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.id, item.quantity)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cartItems.filter(i => !i.removed).length} items)</span>
              <span>৳ {subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>৳ {shippingFee}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>৳ {subtotal+shippingFee}</span>
            </div>
            <button
              className="checkout-btn"
              disabled={cartItems.filter(i => !i.removed).length === 0}
              onClick={() => navigate("/checkout")}
            >
              PROCEED TO CHECKOUT ({cartItems.filter(i => !i.removed).length})
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CartPage;
