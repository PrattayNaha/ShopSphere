import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/sidebar.css";

const Sidebar = ({ menuOpen, setMenuOpen }) => {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const fetchCategoriesWithSubs = async () => {
    try {
      const [categoryRes, subCategoryRes] = await Promise.all([
        api.get("/categories/"),
        api.get("/subcategories/"),
      ]);

      const categories = categoryRes.data;
      const subcategories = subCategoryRes.data;

      // Attach subcategories to each category
      const merged = categories.map((cat) => ({
        ...cat,
        subcategories: subcategories.filter(
          (sub) => sub.category === cat.id
        ),
      }));

      setCategories(merged);
    } catch (error) {
      console.error("Failed to load sidebar data", error);
    }
  };

  useEffect(() => {
    fetchCategoriesWithSubs();
  }, []);

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    navigate(`/category/${categorySlug}/${subcategorySlug}`);
    setMenuOpen(false); // close sidebar after navigation
  };

  return (
    <>
      {menuOpen && (
        <div className="c-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`c-sidebar ${menuOpen ? "open" : ""}`}>
        <h3>Categories</h3>

        {categories.map((cat, index) => (
          <div
            key={cat.id}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="c-category">
              {cat.name}
            </div>

            {activeIndex === index && cat.subcategories.length > 0 && (
              <div className="c-subcategory">
                {cat.subcategories.map((sub) => (
                  <p
                    key={sub.id}
                    className="c-subcategory-item"
                    onClick={() =>
                      handleSubcategoryClick(cat.slug, sub.slug)
                    }
                  >
                    {sub.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
