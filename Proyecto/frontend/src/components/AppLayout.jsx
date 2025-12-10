// src/components/AppLayout.jsx

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom'; // Importar Navigate
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext'; // Importar useAuth

const AppLayout = () => {
  const { isLoggedIn } = useAuth();

  // Si no está logueado, sale de la ruta protegida y va a Login
  if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
  }

  // Si está logueado, muestra la Navbar y el contenido de la ruta anidada
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
