import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/vendorDashboard.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <div className="vendor-dashboard">

      {/* ================= TOP BAR ================= */}
      <div className="topbar">
        <h2>Vendor Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-body">

        {/* ================= SIDEBAR ================= */}
        <div className="sidebar">
          <button onClick={() => setActiveMenu("dashboard")}
            className={activeMenu === "dashboard" ? "active" : ""}>
            Dashboard
          </button>

          <button onClick={() => setActiveMenu("orders")}
            className={activeMenu === "orders" ? "active" : ""}>
            Orders
          </button>

          <button onClick={() => setActiveMenu("products")}
            className={activeMenu === "products" ? "active" : ""}>
            Products
          </button>

          <button onClick={() => setActiveMenu("promotions")}
            className={activeMenu === "promotions" ? "active" : ""}>
            Promotions
          </button>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="content">

          {/* DASHBOARD */}
          {activeMenu === "dashboard" && (
            <>
              <div className="cards">
                <div className="card">Total Sales<br /><strong>$12,500</strong></div>
                <div className="card">Total Orders<br /><strong>320</strong></div>
                <div className="card">Revenue<br /><strong>$9,800</strong></div>
                <div className="card">Top Product<br /><strong>iPhone Case</strong></div>
              </div>

              <div className="charts">
                <div className="chart">📈 Sales Chart (Coming Soon)</div>
                <div className="chart">📊 Best Sellers (Coming Soon)</div>
              </div>
            </>
          )}

          {/* ORDERS */}
          {activeMenu === "orders" && (
            <>
              <h3>Orders</h3>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#101</td>
                    <td>Pending</td>
                    <td>$120</td>
                  </tr>
                  <tr>
                    <td>#102</td>
                    <td>Delivered</td>
                    <td>$250</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* PRODUCTS */}
          {activeMenu === "products" && (
            <>
              <h3>Product Management</h3>
              <button className="primary-btn">➕ Add Product</button>

              <div className="product-card">
                <strong>Product Name</strong>
                <p>Price: $50</p>
                <p>Stock: 20</p>
                <button>Edit</button>
                <button className="danger">Delete</button>
              </div>
            </>
          )}

          {/* PROMOTIONS */}
          {activeMenu === "promotions" && (
            <>
              <h3>Promotions</h3>
              <button className="primary-btn">➕ Create Discount</button>

              <div className="promotion">
                <strong>New Year Sale</strong>
                <p>20% off — Valid till Jan 10</p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
