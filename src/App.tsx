import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import DashboardLayout from './components/layouts/DashboardLayout';
import { UserRole } from './types';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Account from './pages/Account';
import { MagneticCursor } from './components/ui/MagneticCursor';

import OrderDetail from './pages/OrderDetails';
import NotFound from './pages/NotFound';
import VerifyOtp from './pages/VerifyOtp';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAllOrders from './pages/admin/AllOrders';
import ManageProducts from './pages/admin/ManageProducts';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import AdminUsers from './pages/admin/Users';
import SupplierRequests from './pages/admin/SupplierRequests';

import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierOrders from './pages/supplier/Orders';

function App() {
  return (
    <>
      <MagneticCursor />
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="login" element={<Login />} />
        <Route path="verify-otp" element={<VerifyOtp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        {/* Typo redirects */}
        <Route path="forgot password" element={<Navigate to="/forgot-password" replace />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="reset password" element={<Navigate to="/reset-password" replace />} />

        <Route path="register" element={<Register />} />
        <Route path="account" element={<Account />} />
        <Route path="orders" element={<Navigate to="/account" state={{ tab: 'orders' }} replace />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin/Manager Shared Routes */}
      <Route path="/admin" element={<DashboardLayout allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]} title="Superadmin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminAllOrders />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="supplier-requests" element={<SupplierRequests />} />
      </Route>

      <Route path="/manager" element={<DashboardLayout allowedRoles={[UserRole.MANAGER]} title="Manager Panel" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminAllOrders />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="supplier-requests" element={<SupplierRequests />} />
      </Route>

      {/* Supplier Routes */}
      <Route path="/supplier" element={<DashboardLayout allowedRoles={[UserRole.SUPPLIER]} title="Supplier Center" />}>
        <Route index element={<SupplierDashboard />} />
        <Route path="orders" element={<SupplierOrders />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
      </Route>

    </Routes>
    </>
  );
}

export default App;