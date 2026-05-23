import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import StoreLayout from './components/layout/StoreLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Store Pages
import StoreHome from './pages/store/StoreHome';
import ProductDetail from './pages/store/ProductDetail';
import OrderSuccess from './pages/store/OrderSuccess';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManager from './pages/admin/ProductManager';
import OrderManager from './pages/admin/OrderManager';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Storefront */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<StoreHome />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="success" element={<OrderSuccess />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
