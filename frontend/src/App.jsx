import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VendorLogin from "./pages/VendorLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import VendorLayout from "./pages/Vendor/VendorLayout";
import DashboardPage from "./pages/Vendor/DashboardPage.jsx";
import OrdersPage from "./pages/Vendor/OrdersPage.jsx";
import ProductsPage from "./pages/Vendor/ProductsPage.jsx";
import PromotionsPage from "./pages/Vendor/PromotionsPage.jsx";
import CategoriesPage from "./pages/Vendor/CategoriesPage.jsx";
import SubCategoriesPage from "./pages/Vendor/SubCategoriesPage.jsx";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import SubCategoryPage from "./pages/SubCategoryPage";
import CustomerProfile from "./pages/CustomerProfile.jsx";
import CartPage from "./pages/CartPage.jsx";
import OrderCheckout from "./pages/OrderCheckout.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VendorOrderDetails from "./pages/Vendor/VendorOrderDetails.jsx";
import SearchResultPage from "./pages/SearchResultPage.jsx";
import VendorMemo from "./components/VendorMemo.jsx";

function App() {
  return (
    <Routes>

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin" element={<VendorLogin />} />

      <Route path="/" element={<Home />} />
      <Route path="/customer/profile" element={<CustomerProfile />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<OrderCheckout />} />
      <Route path="/order/:orderId" element={<OrderDetails />} />
      <Route path = "/payment" element = {<PaymentPage/>} />

      {/* Product page*/}
      <Route path="/product/:slug" element={<ProductPage />} />
      <Route path="/category/:categorySlug/:subcategorySlug" element={<SubCategoryPage/>} />
      <Route path="/search" element={<SearchResultPage />} />



      {/* Vendor layout with nested pages */}
      <Route path="/vendor" element={<ProtectedRoute><VendorLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="dashboard" />} /> {/* redirect /vendor to /vendor/dashboard */}
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="products" element={<CategoriesPage />} />
      <Route path="promotions" element={<PromotionsPage />} />
      <Route path="/vendor/orders/:orderId" element={<VendorOrderDetails />} />
      <Route path="/vendor/categories" element={<CategoriesPage />} />
      <Route path="/vendor/categories/:categoryId" element={<SubCategoriesPage />} />
      <Route path="/vendor/categories/:categoryId/subcategories/:subcategoryId" element={<ProductsPage />} />
      <Route path="/vendor/memo/:id" element={<VendorMemo />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
