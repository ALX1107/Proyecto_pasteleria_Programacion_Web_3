import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
    genero: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Calcular fuerza de contraseña cuando se cambia el campo password
    if (name === 'password') {
      if (value) {
        const strength = evaluatePasswordStrength(value);
        setPasswordStrength(strength);
      } else {
        setPasswordStrength(null);
      }
    }
  };

  // Función para evaluar la fuerza de la contraseña (igual que en el backend)
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    // Longitud mínima
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Debe tener al menos 8 caracteres');
    }

    // Contiene letras minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener letras minúsculas');
    }

    // Contiene letras mayúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener letras mayúsculas');
    }

    // Contiene números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener números');
    }

    // Contiene caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Debe contener caracteres especiales');
    }

    let strength;
    if (score <= 2) {
      strength = 'débil';
    } else if (score <= 3) {
      strength = 'normal';
    } else {
      strength = 'segura';
    }

    return {
      strength,
      score,
      message: feedback.length > 0 ? feedback.join(', ') : 'Contraseña segura'
    };
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellidos || !formData.email ||
        !formData.telefono || !formData.direccion || !formData.password ||
        !formData.fechaNacimiento || !formData.genero) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    const birthDate = new Date(formData.fechaNacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError('Debes tener al menos 18 años para registrarte');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registerData = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        password: formData.password,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero
      };

      const response = await fetch(`${API}/api/customers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Error en el registro');
      }

      // Auto-login después del registro
      await login(formData.email, formData.password);
      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🍰 Crear Cuenta</h1>
          <p>Únete a Pastelería Java</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género *</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección *</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <PasswordStrengthIndicator
                strength={passwordStrength?.strength}
                score={passwordStrength?.score}
                message={passwordStrength?.message}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="auth-links">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
