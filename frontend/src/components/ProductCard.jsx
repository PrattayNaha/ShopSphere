import React, { useEffect, useState, useContext } from "react";
import { CartContext } from "../components/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/products.css";

// Shuffle utility (optional, can remove if you don't want random order)
const shuffleArray = (array) =>
  [...array]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

const ProductCard = ({ subcategoryId }) => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Responsive logic
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const cardsPerRow = isMobile ? 2 : 4;
  const rowsPerLoad = isMobile ? 6 : 3;
  const itemsPerLoad = cardsPerRow * rowsPerLoad;

  const {fetchCartCount} = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/public/products/", {
          params: subcategoryId ? { subcategory: subcategoryId } : {},
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(shuffleArray(data)); // shuffle if needed
        setVisibleCount(itemsPerLoad);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategoryId, itemsPerLoad]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + itemsPerLoad);
  };

  const handleAddToCart = async (productId) => {
    const accessToken = localStorage.getItem("access");

    if(!accessToken) {
      navigate("/login",{
      state:{redirectTo:`/product/${productId}`},
    });
      return;
    }
    try {
      await api.post("/cart/add/", { product: productId, quantity: 1 });
      fetchCartCount(); // instantly updates badge
    } catch (err) {
      console.error("Failed to add to cart:", err);

      if (err.response && err.response.status === 401) {
        navigate("/login", {
          state: { redirectTo: `/product/${productId}` },
        });
      }
    }
  };

  if (loading) return <p style={{ padding: "50px" }}>Loading products...</p>;
  if (error) return <p style={{ padding: "50px", color: "red" }}>{error}</p>;
  if (products.length === 0) return <p style={{ padding: "50px" }}>No products found.</p>;

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section className="product-section">
      <div className="container">
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="product-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${product.slug}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.slug}`)}
            >
              <img
                src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                alt={product.name}
                loading="lazy"
                onError={(e) => { e.target.src = "https://via.placeholder.com/300x300?text=No+Image"; }}
              />
              <h3 title={product.name}>{product.name}</h3>
              <p className="price">৳{Number(product.price).toLocaleString()}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click
                  handleAddToCart(product.id);
                }}
              >
                Add to Cart
              </button>
            </article>
          ))}
        </div>
        {hasMore && (
          <div className="load-more">
            <button onClick={handleLoadMore}>Load More</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCard;
