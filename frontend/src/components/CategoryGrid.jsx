import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/categories.css";

const CategoryGrid = () => {
  const [subcategories, setSubcategories] = useState([]);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const fetchSubCategories = async () => {
    try {
      const res = await api.get("/subcategories/");
      setSubcategories(res.data);
    } catch (error) {
      console.error("Failed to load subcategories", error);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  // Start slider in the middle
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft =
        sliderRef.current.scrollWidth / 2 - sliderRef.current.clientWidth / 2;
    }
  }, [subcategories]);

  // Drag to scroll
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDown.current = true;
    sliderRef.current.classList.add("active");
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    sliderRef.current.classList.remove("active");
  };

  const onMouseUp = () => {
    isDown.current = false;
    sliderRef.current.classList.remove("active");
  };

  const onMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    navigate(`/category/${categorySlug}/${subcategorySlug}`);
  };

  return (
    <div className="container">
      <section className="category-grid43">
        <div
          ref={sliderRef}
          className="categories-slider"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {subcategories.map((sub) => (
            <div
              className="category-card43"
              key={sub.id}
              onClick={() => handleSubcategoryClick(sub.category_slug, sub.slug)}
              style={{ cursor: "pointer" }}
            >
              <span>{sub.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoryGrid;
