// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import "../styles/vendorDashboard.css";

const VendorSidebar = () => {
  return (
    <div className="vendorsidebar">
      <NavLink to="/vendor/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
        Dashboard
      </NavLink>
      <NavLink to="/vendor/orders" className={({ isActive }) => isActive ? "active" : ""}>
        Orders
      </NavLink>
      <NavLink to="/vendor/products" className={({ isActive }) => isActive ? "active" : ""}>
        Products
      </NavLink>
      <NavLink to="/vendor/promotions" className={({ isActive }) => isActive ? "active" : ""}>
        Promotions
      </NavLink>
    </div>
  );
};

export default VendorSidebar;
