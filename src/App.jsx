import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/auth/Login';
import StoreHome from './pages/store/StoreHome';
import ProductDetail from './pages/store/ProductDetail';
import CheckOut from './pages/store/CheckOut';
import UserProfile from './pages/user/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManager from './pages/admin/ProductManager';
import OrderManager from './pages/admin/OrderManager';
import CategoryManager from './pages/admin/CategoryManager';
import UserManager from './pages/admin/UserManager';
import PaymentSuccess from './pages/payment/PaymentSuccess';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path='/profile' element={<UserProfile />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="categories" element={<CategoryManager />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;