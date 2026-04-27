import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0); // number of different items

  // Fetch current cart items from backend and update cartCount
  const fetchCartCount = async () => {

    const token = localStorage.getItem("access");

    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await api.get("/cart/"); // Django CartDetailView
      const activeItems = res.data.items.filter(item => item.quantity > 0);
      setCartCount(activeItems.length);
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
    }
  };

  const resetCartCount = () => {
    setCartCount(0);
  };

  // On mount, fetch the cart count
  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, resetCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
