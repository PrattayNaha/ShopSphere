import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../icons/search-interface-symbol.png";
import "../styles/mobileSearch.css";
import api from "../services/api";

const MobileSearch = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const res = await api.get(`/products/suggestions/?q=${searchTerm}`);
          setSuggestions(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  if (!isMobile) return null;

  return (
    <div className="mobile-search">
      <img src={searchIcon} alt="Search" className="search-icon" />

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
        <div className="search-dropdown1">
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
  );
};

export default MobileSearch;