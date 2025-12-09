import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import stripePromise from './stripe';

// Páginas
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductManagement from './pages/ProductManagement';
import SalesHistory from './pages/SalesHistory';
import StaffManagement from './pages/StaffManagement';
import AdminDashboard from './pages/AdminDashboard';

// Layout component with Header
const Layout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

// Redirect component for root path
const RootRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  // Redirect based on user type
  if (user.type === 'customer') {
    return <Navigate to="/home" replace />;
  } else if (user.type === 'admin') {
    return <Navigate to="/product-management" replace />;
  } else {
    return <Navigate to="/products" replace />;
  }
};

// Component for role-based product pages (removed - now products are public)

function App() {
  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />

              {/* Protected routes */}
              <Route path="/sales" element={<SalesHistory />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/product-management" element={<ProductManagement />} />

              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* 404 */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <h1>404 - Página no encontrada</h1>
                  <p>La página que buscas no existe.</p>
                </div>
              } />
            </Routes>
          </Layout>
        </AuthProvider>
      </Elements>
    </BrowserRouter>
  );
}

export default App;
