import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import {CartContext} from "../components/CartContext";
import api from "../services/api";
import "../styles/productpage.css";

// RelatedProductCard: clickable card
const RelatedProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <article
      className="related-card"
      role="button"
      tabIndex={0}
      onClick={() =>
        navigate(`/product/${product.slug}`)
      }
      onKeyDown={(e) =>
        e.key === "Enter" &&
        navigate(`/product/${product.slug}`)
      }
    >
      <img
        src={product.image || "https://via.placeholder.com/150"}
        alt={product.name}
        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
      />
      <h4 title={product.name}>{product.name}</h4>
      <p>৳{Number(product.price).toLocaleString()}</p>
    </article>
  );
};

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  const { fetchCartCount } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch main product
        const res = await api.get(`/public/products/${slug}/`);
        setProduct(res.data);

        // Fetch related products (same subcategory, excluding current product)
        if (res.data.subcategory) {
          const relatedRes = await api.get(
            `/public/products/?subcategory=${res.data.subcategory}`
          );
          const relatedProducts = relatedRes.data.filter(
            (p) => Number(p.id) !== Number(res.data.id)
          );
          setRelated(relatedProducts);
        } else {
          setRelated([]);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async (productId) => {
    const accessToken = localStorage.getItem("access");

    if(!accessToken) {
      navigate("/login",{
      state:{redirectTo:`/product/${productId}`},
    });
      return;
    }
    try {
      const selectedVariant = getSelectedVariant();

      if (product.variations.length > 0 && !selectedVariant) {
        alert("Please select all options");
        return;
      }

      await api.post("/cart/add/", {
        product: productId,
        quantity: quantity,
        variant: selectedVariant?.id, // 👈 IMPORTANT
      });
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

  const handleBuyNow = async (productId) => {
    const accessToken = localStorage.getItem("access");

    if(!accessToken) {
      navigate("/login",{
      state:{redirectTo:`/product/${productId}`},
    });
      return;
    }
    try {
      const selectedVariant = getSelectedVariant();

      if (product.variations.length > 0 && !selectedVariant) {
        alert("Please select all options");
        return;
      }

      await api.post("/cart/add/", {
        product: productId,
        quantity: quantity,
        variant: selectedVariant?.id, // 👈 IMPORTANT
      });
      fetchCartCount(); // instantly updates badge
      navigate("/cart");
    } catch (err) {
      console.error("Failed to add to cart:", err);

      if (err.response && err.response.status === 401) {
        navigate("/login", {
          state: { redirectTo: `/product/${productId}` },
        });
      }
    }
  };

  const getSelectedVariant = () => {
    if (!product.variants || product.variants.length === 0) return null;
    console.log("SELECTED OPTIONS:", selectedOptions);
    console.log("ALL VARIANTS:", product.variants);

    return product.variants.find((variant) => {
      const optionIds = variant.options.map((o) => o.id);

      // must match EXACT number of selected options
      if (optionIds.length !== Object.keys(selectedOptions).length) {
        return false;
      }

      return optionIds.every((id) =>
        Object.values(selectedOptions).includes(id)
      );

    });
  };

  if (loading)
    return <p style={{ padding: "50px", textAlign: "center" }}>Loading...</p>;
  if (!product)
    return <p style={{ padding: "50px", textAlign: "center" }}>Product not found.</p>;

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="product-page">
        <div className="container">
          <div className="product-top">
            {/* LEFT – IMAGE */}
            <div className="product-image-card">
              <img
                src={product.image || "https://via.placeholder.com/500x500?text=No+Image"}
                alt={product.name}
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/500x500?text=No+Image")
                }
              />
            </div>

            {/* RIGHT – INFO */}
            <div className="product-info-card1">
              <h1 className="product-title1">{product.name}</h1>

              <div className="price-row">
                <span className="price">
                  ৳{Number(product.price).toLocaleString()}
                </span>
              </div>

              {product.variations?.map((variation) => (
                <div key={variation.id} className="variation-group">
                  <h4>{variation.name}</h4>

                  <div className="variation-options">
                    {variation.options.map((opt) => (
                      <button
                        key={opt.id}
                        className={
                          selectedOptions[variation.name] === opt.id
                            ? "option-btn12 active"
                            : "option-btn12"
                        }
                        onClick={() =>
                          setSelectedOptions({
                            ...selectedOptions,
                            [variation.name]: opt.id,
                          })
                        }
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="quantity-row1">
                <span>Quantity</span>
                <div className="qty-box1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="action-buttons1">
                <button className="buy-now1"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    handleBuyNow(product.id);
                  }}
                >
                  Buy Now
                </button>
                <button className="add-cart1" 
                  onClick={(e) => {
                    e.stopPropagation(); // prevent card click
                    handleAddToCart(product.id);
                  }}
                >
                  Add to Cart
                </button>
              </div>

              <ul className="product-meta">
                <li>✔ Return: 3 Days</li>
                <li>✔ Exchange: 3 Days</li>
                <li>✔ Delivery: 2 Days</li>
                <li>✔ Payment: COD Available</li>
              </ul>
            </div>
          </div>

          {/* PRODUCT DESCRIPTION */}
          <div className="product-description">
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="related-products">
            <h2>Related Products</h2>
            {related.length === 0 ? (
              <p>No related products found.</p>
            ) : (
              <div className="related-slider">
                {related.map((p) => (
                  <RelatedProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductPage;
