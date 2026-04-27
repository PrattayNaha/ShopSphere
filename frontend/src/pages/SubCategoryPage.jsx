import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { CartContext } from "../components/CartContext";
import api from "../services/api";
import "../styles/subcategorypage.css";

const SubCategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subcategoryId, setSubcategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMin, setAppliedMin] = useState("");
  const [appliedMax, setAppliedMax] = useState("");

  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get all subcategories and find the one matching subcategorySlug
        const subcatRes = await api.get("/subcategories/");
        const subcat = subcatRes.data.find(
          (s) => s.slug === subcategorySlug
        );
        if (!subcat) {
          console.error("Subcategory not found");
          setLoading(false);
          return;
        }

        setSubcategoryId(subcat.id);

        // 2. Fetch products for this subcategory
        const productsRes = await api.get("/public/products/", {
          params: { subcategory: subcat.id,
            min_price: appliedMin || undefined,
            max_price: appliedMax || undefined,
           },
        });
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Failed to fetch subcategory or products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subcategorySlug, appliedMin, appliedMax]);

  const handleAddToCart = async (productId) => {
    const accessToken = localStorage.getItem("access");
    if (!accessToken) {
      navigate("/login", { state: { redirectTo: `/product/${productId}` } });
      return;
    }

    try {
      await api.post("/cart/add/", { product: productId, quantity: 1 });
      fetchCartCount(); // instantly updates cart badge
    } catch (err) {
      console.error("Failed to add to cart:", err);
      if (err.response && err.response.status === 401) {
        navigate("/login", { state: { redirectTo: `/product/${productId}` } });
      }
    }
  };

  if (loading) return <p style={{ padding: "50px" }}>Loading...</p>;
  if (!products.length) return <p style={{ padding: "50px" }}>No products found.</p>;

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="subcategory-page">
        <div className="subcategory-container">
          <h1 className="subcategory-title">
            {subcategorySlug.replace("-", " ")}
          </h1>
          
          <div className="filter-bar">
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <button
              onClick={() => {
                if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
                  alert("Min price cannot be greater than max price");
                  return;
                }

                setAppliedMin(minPrice);
                setAppliedMax(maxPrice);
              }}
            >
              Apply
            </button>
          </div>
          <div className="subcategory-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="subcategory-card"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <div className="subcategory-card-image">
                  <img
                    src={
                      product.image ||
                      "https://via.placeholder.com/300x300?text=No+Image"
                    }
                    alt={product.name}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/300x300?text=No+Image")
                    }
                  />
                </div>
                <div className="subcategory-card-body">
                  <h3>{product.name}</h3>
                  <p className="subcategory-price">
                    ৳{Number(product.price).toLocaleString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                  >
                    Add to Cart
                  </button>
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

export default SubCategoryPage;