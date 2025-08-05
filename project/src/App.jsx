import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import OrdersPage from './pages/OrdersPage';
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Customer Route Component
const CustomerRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedUserTypes={['customer']}>
      {children}
    </ProtectedRoute>
  );
};

// Seller Route Component  
const SellerRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedUserTypes={['seller']}>
      {children}
    </ProtectedRoute>
  );
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedUserTypes={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />

                {/* Customer Routes */}
                <Route path="/cart" element={
                  <CustomerRoute>
                    <CartPage />
                  </CustomerRoute>
                } />
                <Route path="/favorites" element={
                  <CustomerRoute>
                    <FavoritesPage />
                  </CustomerRoute>
                } />
                <Route path="/orders" element={
                  <CustomerRoute>
                    <OrdersPage />
                  </CustomerRoute>
                } />

                {/* Seller Routes */}
                <Route path="/seller/dashboard" element={
                  <SellerRoute>
                    <SellerDashboard />
                  </SellerRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                {/* forgot pass*/}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Authenticated Routes */}
                {/* 404 Route */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-xl text-gray-600 mb-8">Page not found</p>
                      <button 
                        onClick={() => window.history.back()}
                        className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;