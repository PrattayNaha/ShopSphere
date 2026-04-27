import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SubCategoriesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchSubCategories = async () => {
    const res = await api.get("/subcategories/");
    const filtered = res.data
      .filter((s) => s.category === Number(categoryId))
      .sort((a, b) => a.name.localeCompare(b.name));

    setSubcategories(filtered);
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/subcategories/${editingId}/`, {
        name,
        slug: slugify(name),
        category: categoryId,
      });
    } else {
      await api.post("/subcategories/", {
        name,
        slug: slugify(name),
        category: categoryId,
      });
    }

    setName("");
    setEditingId(null);
    fetchSubCategories();
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setName(sub.name);
  };

  return (
    <div className="content">
      <h3>Subcategory Management</h3>

      <form className="form-bar" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Enter subcategory name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="primary-btn1">
          {editingId ? "Update" : "Create"}
        </button>
      </form>

      <div className="card-grid">
        {subcategories.map((s) => (
          <div key={s.id} className="vendor-category-card">
            <h4
              onClick={() =>
                navigate(
                  `/vendor/categories/${categoryId}/subcategories/${s.id}`
                )
              }
            >
              {s.name}
            </h4>

            <button
              className="edit-btn1"
              onClick={() => handleEdit(s)}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubCategoriesPage;
