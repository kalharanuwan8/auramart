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

// Protected Route Component - Enhanced with debugging
const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { currentUser, loading } = useAuth(); // Fixed: use currentUser instead of user

  console.log('🛡️ ProtectedRoute check:', {
    currentUser: currentUser?.email,
    userRole: currentUser?.role,
    allowedUserTypes,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Fixed: use currentUser.role instead of currentUser.userType
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(currentUser.role)) {
    console.log('❌ Insufficient permissions. User role:', currentUser.role, 'Allowed:', allowedUserTypes);
    return <Navigate to="/" replace />;
  }

  console.log('✅ Access granted to user:', currentUser.email, 'with role:', currentUser.role);
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

// Auth Debug Component - Remove this in production
const AuthDebug = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="fixed top-4 right-4 p-4 bg-yellow-100 border border-yellow-400 rounded text-xs">Loading...</div>;
  }

  return (
    <div className="fixed top-4 right-4 p-4 bg-blue-100 border border-blue-400 rounded max-w-md text-xs z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <div>
        <p><strong>User Logged In:</strong> {currentUser ? 'Yes' : 'No'}</p>
        {currentUser && (
          <>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <p><strong>UID:</strong> {currentUser.uid}</p>
            <p><strong>Display Name:</strong> {currentUser.displayName}</p>
          </>
        )}
        <hr className="my-2" />
        <p><strong>localStorage:</strong></p>
        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
          {JSON.stringify(JSON.parse(localStorage.getItem('user') || 'null'), null, 2)}
        </pre>
      </div>
    </div>
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
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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