// src/components/Topbar.jsx
import { useNavigate } from "react-router-dom";

const VendorTopbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <div className="vendortopbar">
      <h2>Vendor Dashboard</h2>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default VendorTopbar;
