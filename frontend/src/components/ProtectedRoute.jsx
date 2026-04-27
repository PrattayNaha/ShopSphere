import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  // Not logged in → go to vendor login
  if (!token) {
    return (
      <Navigate
        to="/admin"
        replace
        state={{ from: location }}
      />
    );
  }

  // Logged in but NOT vendor → go home
  if (role !== "VENDOR") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
