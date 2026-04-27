import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/footer.css";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/");
        const data = Array.isArray(res.data) ? res.data : [];

        // Deduplicate by ID (safety)
        const uniqueCategories = Array.from(
          new Map(data.map((c) => [c.id, c])).values()
        );

        if (isMounted) {
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer>
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <h3>ShopSphere</h3>
          <p>Your one-stop online shop for everything!</p>
        </div>

        {/* Links */}
        <div className="footer-links">
          {/* Categories */}
          <div>
            <h4>Categories</h4>
            <ul>
              {loading && <li>Loading...</li>}
              {!loading && categories.length === 0 && (
                <li>No categories</li>
              )}
              {!loading &&
                categories.map((cat) => (
                  <li key={cat.id}>{cat.name}</li>
                ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4>Customer Service</h4>
            <ul>
              <li>Help Center</li>
              <li>Shipping</li>
              <li>Returns</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4>Follow Us</h4>
            <ul>
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Twitter</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ShopSphere. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
