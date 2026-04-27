import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/topbar.css";
import { CartContext } from "../components/CartContext";
import api from "../services/api";

import userIcon from "../icons/user.png";
import searchIcon from "../icons/search-interface-symbol.png";
import cartIcon from "../icons/shopping-cart.png";
import menuIcon from "../icons/burger-bar.png";
import logo from "../logo/logo.png";

const Topbar = ({ menuOpen, setMenuOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("access");

  // Access cart count from context
  const { cartCount } = useContext(CartContext);

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length>1){
      const fetchSuggestions = async () => {
        try{
          const res = await api.get(`/products/suggestions/?q=${searchTerm}`);
          setSuggestions(res.data);
        } catch (err){
          console.error(err);
        }
      };
      fetchSuggestions();
    } else(
      setSuggestions([])
    )
  }, [searchTerm]);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setProfileOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
      {/* LEFT */}
      <div className="topbar-left">
        <button className="icon-btn11" onClick={() => setMenuOpen(!menuOpen)}>
          <img className="topbar-icon11" src={menuIcon} alt="Menu" />
        </button>

        <Link
          to="/"
          className="logo-container"
          style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <img src={logo} alt="ShopSphere Logo" className="topbar-icon2" />
          <h1 className="logo">ShopSphere</h1>
        </Link>
      </div>

      {/* CENTER */}
      <div className="topbar-search">
        <img src={searchIcon} alt="Search" className="topbar-icon11" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate(`/search?q=${searchTerm}`);
              setSuggestions([]);
            }
          }}
        />
        {suggestions.length > 0 && (
          <div className="search-dropdown">
            {suggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.slug}`)}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* RIGHT */}
      <div className="topbar-right" ref={dropdownRef}>
        {/* Cart icon with badge */}
        <button
          className="icon-btn11"
          onClick={() => {
            if (isAuthenticated) {
              navigate("/cart");
            } else {
              navigate("/login");
            }
          }}
          style={{ position: "relative" }}
        >
          <img src={cartIcon} alt="Cart" className="topbar-icon11" />
          {isAuthenticated && cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </button>
        {/* Profile button */}
        <button className="icon-btn11 profile-btn" onClick={handleProfileClick}>
          <img src={userIcon} alt="User profile" className="topbar-icon11" />
        </button>

        {/* PROFILE DROPDOWN */}
        {isAuthenticated && profileOpen && (
          <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setProfileOpen(false);
                navigate("/customer/profile", { state: { section: "account" } });
              }}
            >
              Manage Profile
            </button>
            <button
              onClick={() => {
                setProfileOpen(false);
                navigate("/customer/profile", { state: { section: "orders" } });
              }}
            >
              My Orders
            </button>
            <hr />
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
