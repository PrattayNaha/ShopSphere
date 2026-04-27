import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    const res = await api.get("/categories/");
    const sorted = res.data.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setCategories(sorted);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}/`, {
          name,
          slug: slugify(name), // send slug on update
        });
      } else {
        await api.post("/categories/", {
          name,
          slug: slugify(name),
        });
      }

      setName("");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
      alert(
        "Failed to update category. Check console for details. Likely slug is not unique."
      );
    }
  };




  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  return (
    <div className="content">
      <h3>Category Management</h3>

      {/* CREATE / EDIT BAR */}
      <form className="form-bar" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="primary-btn1">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      {/* CATEGORY GRID */}
      <div className="card-grid">
        {categories.map((c) => (
          <div key={c.id} className="vendor-category-card">
            <h4 onClick={() => navigate(`/vendor/categories/${c.id}`)}>
              {c.name}
            </h4>

            <button
              className="edit-btn1"
              onClick={() => handleEdit(c)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
