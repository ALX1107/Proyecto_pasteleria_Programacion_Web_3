// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- ¡IMPORTANTE!

import App from './App.jsx';
import './index.css';

// Asegúrate que el ID 'root' exista en tu index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
