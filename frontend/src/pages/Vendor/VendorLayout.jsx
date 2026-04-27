// src/pages/vendor/VendorLayout.jsx
import VendorSidebar from "../../components/VendorSidebar";
import VendorTopbar from "../../components/VendorTopbar";
import { Outlet } from "react-router-dom";

const VendorLayout = () => {
  return (
    <div className="vendor-dashboard">
      <VendorTopbar />
      <div className="dashboard-body">
        <VendorSidebar />
        {/* This is where the active page will render */}
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};


export default VendorLayout;
