import React, { useState, useEffect } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import api from "../services/api";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../styles/customerProfile.css";
import { useNavigate } from "react-router-dom";

const CustomerProfile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("account");

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [cancelledOrders, setCancelledOrders] = useState([]);


  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    mobile_number: "",
    payment_option: "",
  });

  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    address_line: "",
    city: "",
    postal_code: "",
    phone_number: "",
    is_default: false,
  });

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await api.delete(`/orders/${orderId}/cancel/`);
      alert("Order canceled successfully!");

      // Move order from orders -> cancelledOrders
      setOrders((prevOrders) => {
        const canceledOrder = prevOrders.find((o) => o.id === orderId);
        if (!canceledOrder) return prevOrders;
        setCancelledOrders((prev) => [
          { ...canceledOrder, status: "CANCELLED" },
          ...prev
        ]);
        return prevOrders.filter((o) => o.id !== orderId);
      });
    } catch (err) {
      console.error("Failed to cancel order", err);
      alert("Failed to cancel order. Only pending orders can be canceled.");
    }
  };



  const handleEditProfile = () => {
    setProfileForm({
      username: profile?.username || "",
      mobile_number: profile?.mobile_number || "",
      payment_option: profile?.payment_option || "COD",
    });
    setIsEditingProfile(true);
  };

  const handleEditAddress = (address) => {
    setAddressForm({ ...address });
    setEditingAddressId(address.id);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveProfile = async () => {
    try {
      await api.put("profile/update/", profileForm);
      setProfile({ ...profile, ...profileForm });
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const saveAddress = async () => {
    try {
      await api.put(`addresses/${editingAddressId}/`, addressForm);
      // Refresh addresses list
      fetchAddresses();
      setEditingAddressId(null);
    } catch (err) {
      console.error("Error updating address", err);
    }
  };

  const saveNewAddress = async () => {
    try {
      await api.post("addresses/", addressForm); // POST for new address
      fetchAddresses(); // refresh list
      setEditingAddressId(null);
    } catch (err) {
      console.error("Error adding new address", err);
    }
  };

  const token = localStorage.getItem("access"); // JWT token

  const fetchProfile = async () => {
    try {
      const res = await api.get("profile/");
      console.log("Profile response:", res.data);
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("orders/");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching orders", err);
      setOrders([]);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("addresses/");
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching addresses", err);
      setAddresses([]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchAddresses();
  }, []);
  
  useEffect(() => {
  if (location.state?.section) {
    setActiveSection(location.state.section);
  }
}, [location.state]);

  const truncateText = (text, max = 32) =>
  text?.length > max ? text.slice(0, max) + "..." : text;

  const getFirstItem = (order) => order.items?.[0];
  
  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <>
            {/* PERSONAL PROFILE */}
            <div className="profile-card">
              <h3>Personal Profile</h3>
              <p><strong>Name:</strong> {profile?.username || "-"}</p>
              <p><strong>Email:</strong> {profile?.email || "-"}</p>
              <p><strong>Mobile Number:</strong> {profile?.mobile_number || "-"}</p>
            </div>

            {/* ADDRESS BOOK */}
            <div className="profile-card">
              <h3>Address Book</h3>
              {addresses.length === 0 ? (
                <p>No addresses saved.</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id}>
                    <p>{addr.label}: {addr.address_line}, {addr.city}</p>
                    <p>📞 {addr.phone_number}</p>
                  </div>
                ))
              )}
            </div>

            {/* RECENT ORDERS */}
            <div className="profile-card2">
              <h3>Recent Orders</h3>
              {orders.length === 0 ? (
                <p>No recent orders found.</p>
              ) : (
                <table className="recent-orders-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3).map((order) => {
                    const item = getFirstItem(order);
                    return (
                      <tr key={order.id}>
                        <td className="product-cell">
                          <img
                            src={
                                item?.product_image
                                  ? `http://127.0.0.1:8000${item.product_image}`
                                  : "/placeholder.png"
                            }
                            alt={item?.product_name}
                            className="product-thumb"
                          />
                          <span>{truncateText(item?.product_name)}</span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{order.total_quantity}</td>
                        <td>৳ {order.grand_total}</td>
                        <td className={`status ${order.status?.toLowerCase() || ""}`}>
                          {order.status || "Pending"}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </>
        );

      case "profile":
        return (
          <div className="profile-card">
            <h3>Personal Profile</h3>
            {isEditingProfile ? (
              <>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  placeholder="Name"
                  className="form-input"
                />
                <input
                  type="text"
                  name="mobile_number"
                  value={profileForm.mobile_number}
                  onChange={handleProfileChange}
                  placeholder="Mobile Number"
                  className="form-input"
                />
                <button className="save-btn" onClick={saveProfile}>Save</button>
                <button className="cancel-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {profile?.username || "-"}</p>
                <p><strong>Email:</strong> {profile?.email || "-"}</p>
                <p><strong>Mobile Number:</strong> {profile?.mobile_number || "-"}</p>
                <button className="edit-btn-c" onClick={handleEditProfile}>Edit</button>
              </>
            )}
          </div>

        );

      case "address":
        return (
          <div className="profile-card">
            <h3>Address Book</h3>
            {/* If no addresses and not editing yet, show Add button */}
            {addresses.length === 0 && editingAddressId === null && (
              <button
                onClick={() => {
                  setEditingAddressId("new");
                  setAddressForm({
                    label: "",
                    address_line: "",
                    city: "",
                    postal_code: "",
                    phone_number: "",
                    is_default: false,
                  });
                }}
                className="edit-btn-c"
              >
                Add New Address
              </button>
            )}

            {/* Render form for new address if editingAddressId === "new" */}
            {editingAddressId === "new" && (
              <div className="address-item">
                <input
                  type="text"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                  placeholder="Home, Office, etc."
                  className="form-input"
                />
                <input
                  type="text"
                  name="address_line"
                  value={addressForm.address_line}
                  onChange={handleAddressChange}
                  placeholder="Address"
                  className="form-input"
                />
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="form-input"
                />
                <input
                  type="text"
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressChange}
                  placeholder="Postal Code"
                  className="form-input"
                />
                <input
                  type="text"
                  name="phone_number"
                  value={addressForm.phone_number}
                  onChange={handleAddressChange}
                  placeholder="Phone"
                  className="form-input"
                />
                <label className="checkbox-label">
                  Default:
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={addressForm.is_default}
                    onChange={handleAddressChange}
                  />
                </label>
                <div className="form-buttons">
                  <button onClick={saveNewAddress} className="save-btn">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAddressId(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Map existing addresses and allow editing them */}
            {addresses.map((addr) => {
              const isEditing = editingAddressId === addr.id;
              return (
                <div key={addr.id} className="address-item">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="label"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                        placeholder="Home, Office, etc."
                        className="form-input"
                      />
                      <input
                        type="text"
                        name="address_line"
                        value={addressForm.address_line}
                        onChange={handleAddressChange}
                        placeholder="Address"
                        className="form-input"
                      />
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="form-input"
                      />
                      <input
                        type="text"
                        name="postal_code"
                        value={addressForm.postal_code}
                        onChange={handleAddressChange}
                        placeholder="Postal Code"
                        className="form-input"
                      />
                      <input
                        type="text"
                        name="phone_number"
                        value={addressForm.phone_number}
                        onChange={handleAddressChange}
                        placeholder="Phone"
                        className="form-input"
                      />
                      <label className="checkbox-label">
                        Default:
                        <input
                          type="checkbox"
                          name="is_default"
                          checked={addressForm.is_default}
                          onChange={handleAddressChange}
                        />
                      </label>
                      <div className="form-buttons">
                        <button onClick={saveAddress} className="save-btn">
                          Save
                        </button>
                        <button
                          onClick={() => setEditingAddressId(null)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>{addr.label}</strong>: {addr.address_line}, {addr.city}
                      </p>
                      <p>📞 {addr.phone_number}</p>
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="edit-btn-c"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        );
      case "payment":
        return (
          <div className="profile-card">
            <h3>My Payment Options</h3>
            <select
                  name="payment_option"
                  className="selection-input"
                  value={profileForm.payment_option}
                  onChange={handleProfileChange}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="BKASH">Stripe</option>
            </select>
          </div>
        );

      case "orders":
        return (
          <div className="profile-card">
            <h3>My Orders</h3>
            <div className="profile-card2">
              <table className="recent-orders-table2">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .filter(order => ["COD","PENDING", "PAID"].includes(order.status)) // <- only pending or success
                    .map((order) => {
                      const item = getFirstItem(order);
                      return (
                        <tr key={order.id} onClick={() => navigate(`/order/${order.id}`)} style={{ cursor: "pointer" }}>
                          <td className="product-cell">
                            <img
                              src={item?.product_image
                                    ? `http://127.0.0.1:8000${item.product_image}`
                                    : "/placeholder.png"}
                              alt={item?.product_name}
                              className="product-thumb"
                            />
                            <span>{truncateText(item?.product_name)}</span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>{order.total_quantity}</td>
                          <td>৳ {order.grand_total}</td>
                          <td className={`status ${order.status?.toLowerCase() || ""}`}>
                            {order.status || "Pending"}
                          </td>
                          <td>
                            {order.status === "PENDING" && (
                              <button
                                className="cancel-btn"
                                onClick={ (e) =>{e.stopPropagation(); handleCancelOrder(order.id)}}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "returns":
        return (
          <div className="profile-card">
            <h3>My Returns</h3>
            <p>No return requests found.</p>
          </div>
        );

      case "cancellations":
        const cancelled = orders.filter(
          order => order.status === "CANCELLED"
        );

        return (
          <div className="profile-card">
            <h3>My Cancellations</h3>

            {cancelled.length === 0 ? (
              <p>No cancelled orders.</p>
            ) : (
              <table className="recent-orders-table2">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {cancelled.map((order) => {
                    const item = getFirstItem(order);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/order/${order.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="product-cell">
                          <img
                            src={
                              item?.product_image
                                ? `http://127.0.0.1:8000${item.product_image}`
                                : "/placeholder.png"
                            }
                            alt={item?.product_name}
                            className="product-thumb"
                          />
                          <span>{truncateText(item?.product_name)}</span>
                        </td>

                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{order.total_quantity}</td>
                        <td>৳ {order.total_price}</td>

                        <td className="status cancelled">
                          {order.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="customer-profile-page">
        <div className="profile-container">

          {/* LEFT MENU */}
          <aside className="profile-menu">
            <h4 className={activeSection === "account" ? "menu-title active" : "menu-title"}
                onClick={() => setActiveSection("account")}>
                Manage My Account
            </h4>
            <ul>
              <li onClick={() => setActiveSection("profile")} className={activeSection === "profile" ? "active" : ""}>My Profile</li>
              <li onClick={() => setActiveSection("address")} className={activeSection === "address" ? "active" : ""}>Address Book</li>
              <li onClick={() => setActiveSection("payment")} className={activeSection === "payment" ? "active" : ""}>My Payment Options</li>
            </ul>

            <h4 className={activeSection === "orders" ? "menu-title active" : "menu-title"}
                onClick={() => setActiveSection("orders")}>My Orders</h4>
            <ul>
              <li onClick={() => setActiveSection("returns")} className={activeSection === "returns" ? "active" : ""}>My Returns</li>
              <li onClick={() => setActiveSection("cancellations")} className={activeSection === "cancellations" ? "active" : ""}>My Cancellations</li>
            </ul>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="profile-content">
            {renderContent()}
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default CustomerProfile;
