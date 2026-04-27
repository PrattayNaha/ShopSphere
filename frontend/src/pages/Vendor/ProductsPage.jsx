import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

const ProductsPage = () => {
  const { categoryId, subcategoryId } = useParams();
  const [subcategoryName, setSubcategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [variations, setVariations] = useState([]);
  const [variants, setVariants] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });

  // Fetch subcategory name
  const fetchSubcategoryName = async () => {
    if (!subcategoryId) return;
    try {
      const res = await api.get(`/subcategories/${subcategoryId}/`);
      setSubcategoryName(res.data.name);
    } catch (err) {
      console.error("Failed to fetch subcategory:", err);
    }
  };

  // Fetch products for this subcategory
  const fetchProducts = async () => {
    if (!subcategoryId) return;
    try {
      setLoading(true);
      const res = await api.get("/vendor/products/", {
        params: { subcategory: subcategoryId },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategoryName();
    fetchProducts();
  }, [subcategoryId]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setVariations([]);
    setVariants([]);
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      image: null,
      category: Number(categoryId),      // add this
      subcategory: Number(subcategoryId) // add this
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      image: null,
      category: product.category.id || product.category, // numeric ID
      subcategory: product.subcategory?.id || product.subcategory, // numeric ID
    });

    if (product.variations) {
      const formatted = product.variations.map(v => ({
        name: v.name,
        options: v.options.map(o => o.value),
      }))
      setVariations(formatted);
    }
    setShowModal(true);
    console.log("EDIT PRODUCT:", product);

    if (product.variants) {
      const formattedVariants = product.variants.map(v => ({
        options: v.options.map(o => o.value),
      }));

      setVariants(formattedVariants);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      let productId = editingProduct?.id;

      // =====================
      // 1. CREATE or UPDATE
      // =====================
      if (editingProduct) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("category", form.category);
        formData.append("subcategory", form.subcategory);
        formData.append("price", form.price);
        formData.append("stock", form.stock);

        // only send image if user selected a new one
        if (form.image) {
          formData.append("image", form.image);
        }

        await api.put(`/vendor/products/${editingProduct.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("category", form.category);
        formData.append("subcategory", form.subcategory);
        formData.append("price", form.price);
        formData.append("stock", form.stock);

        if (form.image) {
          formData.append("image", form.image);
        }

        const productRes = await api.post("/vendor/products/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        productId = productRes.data.id;
      }

      // =====================
      // 2. Variations
      // =====================
      const optionIdMap = {};

      if (editingProduct) {
        // correct order
        await api.delete(`/products/${productId}/delete-variants/`);
      }

      // create fresh variations (for BOTH create + edit)
      for (const v of variations) {
        if (!v.name?.trim()) continue;

        const res = await api.post("/variations/", {
          name: v.name,
          product: productId,
        });
        console.log("PRODUCT DATA:", res.data);

        for (const opt of v.options) {
          if (!opt.trim()) continue;

          const optRes = await api.post("/variation-options/", {
            variation: res.data.id,
            value: opt.trim(),
          });

          if (!optionIdMap[v.name]) {
            optionIdMap[v.name] = {};
          }

          optionIdMap[v.name][opt.trim()] = optRes.data.id;
        }
      }

      // =====================
      // 3. Variants (only create mode usually)
      // =====================
      for (const variant of variants) {
        await api.post("/product-variants/", {
          product: productId,
          options: variant.options.map((o, index) => {
            const variationName = variations[index]?.name;
            return optionIdMap[variationName][o.trim()];
          })
        });
      }

      setShowModal(false);
      fetchProducts();

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/vendor/products/${id}/`);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const generateVariants = () => {
    if (variations.length === 0) return;

    const combine = (arr) => {
      return arr.reduce(
        (acc, curr) =>
          acc.flatMap((x) => curr.options.map((y) => [...x, y])),
        [[]]
      );
    };

    const combos = combine(variations);

    const newVariants = combos.map((combo) => ({
      options: combo,
      price: "",
      stock: "",
    }));

    setVariants(newVariants);
  };

  return (
    <div className="content">
      <h3>{subcategoryName ? `${subcategoryName} / Products` : "Products"}</h3>

      <button className="primary-btn" onClick={openCreateModal}>
        Create Product
      </button>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found for this subcategory.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
              <th>Variations</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.image && (
                    <img
                      src={p.image}
                      width="50"
                      alt={p.name}
                    />
                  )}
                </td>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="edit-btn1" onClick={() => openEditModal(p)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
                <td>
                  {p.variations && p.variations.length > 0 ? (
                    <ul>
                      {p.variations.map((variation) => (
                        <li key={variation.id}>
                          <strong>{variation.name}:</strong>{" "}
                          {variation.options.map((opt) => opt.value).join(", ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No Variations"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? "Edit Product" : "Create Product"}</h3>
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
              />
              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                required
              />
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={handleChange}
                required
              />
              <input type="file" name="image" onChange={handleChange} />

              <h4>Variations</h4>

                {variations.map((v, i) => (
                  <div key={i}>
                    <input
                      placeholder="Variation name (e.g. Size)"
                      value={v.name}
                      onChange={(e) => {
                        const updated = [...variations];
                        updated[i].name = e.target.value;
                        setVariations(updated);
                      }}
                    />

                    <input
                      placeholder="Options (comma separated: S,M,L)"
                      value={v.options.join(",")}
                      onChange={(e) => {
                        const updated = [...variations];
                        updated[i].options = e.target.value.split(",");
                        setVariations(updated);
                      }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setVariations([...variations, { name: "", options: [] }])}
                >
                  + Add Variation
                </button>
                <button type="button" onClick={generateVariants}>
                  Generate Variants
                </button>


              <div className="modal-actions">
                <button
                  type="button"
                  className="danger"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  {editingProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;