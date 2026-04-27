import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../styles/subcategorypage.css";

const SearchResultPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const res = await api.get(`/products/search/?q=${query}`);
        setProducts(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearchResults();
  }, [query]);

  if (loading) return <p style={{ padding: "50px" }}>Searching...</p>;
  if (products.length === 0)
    return <p style={{ padding: "50px" }}>No products found.</p>;

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="subcategory-page">
        <div className="subcategory-container">
          <h1 className="subcategory-title">
            Search Results for "{query}"
          </h1>

          <div className="subcategory-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="subcategory-card"
                onClick={() =>
                  (window.location.href = `/product/${product.slug}`)
                }
              >
                <div className="subcategory-card-image">
                  <img
                    src={
                      product.image ||
                      "https://via.placeholder.com/300x300?text=No+Image"
                    }
                    alt={product.name}
                  />
                </div>
                <div className="subcategory-card-body">
                  <h3>{product.name}</h3>
                  <p className="subcategory-price">
                    ৳{Number(product.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SearchResultPage;
