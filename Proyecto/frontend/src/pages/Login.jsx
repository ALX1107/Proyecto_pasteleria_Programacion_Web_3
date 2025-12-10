// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaId, setCaptchaId] = useState(null);
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const fetchCaptcha = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${API}/api/auth/captcha`);

        if (!res.ok) {
          console.warn('Captcha endpoint status:', res.status);
          setCaptchaEnabled(false);
          return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.warn('Captcha endpoint returned non-JSON:', contentType);
          setCaptchaEnabled(false);
          return;
        }

        const data = await res.json();
        setCaptchaId(data.id);
        setCaptchaSvg(data.data);
        setCaptchaEnabled(true);
      } catch (err) {
        console.warn('No se pudo obtener captcha', err);
        setCaptchaEnabled(false);
      }
    };
    fetchCaptcha();
  }, []);

  const refreshCaptcha = async () => {
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API}/api/auth/captcha`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      setCaptchaId(data.id);
      setCaptchaSvg(data.data);
      setCaptchaValue('');
      setCaptchaEnabled(true);
    } catch (error) {
      console.warn('Error al refrescar captcha:', error);
      setCaptchaEnabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, { id: captchaId, value: captchaValue });
    } catch (err) {
      setError(err.message);

      if (captchaEnabled) {
        await refreshCaptcha();
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <div className="form-container">
        <h1>☕ Login Pastelería Java</h1>
        <p>¡Bienvenido!</p>

        {error && (
          <p style={{ color: 'var(--container-color-2)' }}>{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Correo */}
          <div>
            <label>Correo:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
              }}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
              }}
            />
          </div>

          {/* CAPTCHA en recuadro oscuro */}
          {captchaEnabled && (
            <div
              style={{
                marginTop: 12,
                marginBottom: 16,
                padding: '12px 14px',
                backgroundColor: '#2c3e50',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              {captchaSvg && (
                <div
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              )}
              <input
                type="text"
                placeholder="Ingresa el texto del captcha"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value)}
                required={captchaEnabled}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'var(--container-color-2)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Iniciar Sesión
          </button>

          {!captchaEnabled && (
            <p style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
              (Captcha desactivado: no se pudo contactar al servidor de captcha)
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
