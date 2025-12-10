import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    contraseña: '',
    edad: '',
    direccion: '',
    celular: ''
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      // En una implementación real, esto vendría de una API
      // Por ahora, datos de ejemplo
      setEmployees([
        {
          _id: '1',
          nombre: 'Juan',
          apellidos: 'Pérez',
          correo: 'juan@pasteleria.com',
          edad: 25,
          direccion: 'Avenida Central 456',
          celular: '987654321',
          rol: 'Employee'
        },
        {
          _id: '2',
          nombre: 'María',
          apellidos: 'García',
          correo: 'maria@pasteleria.com',
          edad: 28,
          direccion: 'Calle Bolívar 789',
          celular: '912345678',
          rol: 'Employee'
        }
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Actualizar empleado
        console.log('Actualizando empleado:', editingEmployee._id, formData);
        // Aquí iría la llamada a la API
      } else {
        // Crear nuevo empleado
        console.log('Creando nuevo empleado:', formData);
        // Aquí iría la llamada a la API
      }

      await loadEmployees();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      nombre: employee.nombre,
      apellidos: employee.apellidos,
      correo: employee.correo,
      contraseña: '', // No mostrar contraseña existente
      edad: employee.edad.toString(),
      direccion: employee.direccion,
      celular: employee.celular
    });
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
      console.log('Eliminando empleado:', employeeId);
      // Aquí iría la llamada a la API
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      correo: '',
      contraseña: '',
      edad: '',
      direccion: '',
      celular: ''
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Calcular fuerza de contraseña cuando se cambia el campo contraseña
    if (name === 'contraseña') {
      if (value) {
        const strength = evaluatePasswordStrength(value);
        setPasswordStrength(strength);
      } else {
        setPasswordStrength(null);
      }
    }
  };

  // Función para evaluar la fuerza de la contraseña
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

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando empleados...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>👥 Gestión de Empleados</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          {showForm ? 'Cancelar' : '+ Agregar Empleado'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 20 }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#f9f9fa',
          padding: 20,
          borderRadius: 8,
          marginBottom: 20
        }}>
          <h3>{editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginTop: 15 }}>
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div>
              <label>Apellidos:</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div>
              <label>Correo:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            {!editingEmployee && (
              <div>
                <label>Contraseña:</label>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  required={!editingEmployee}
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
                <PasswordStrengthIndicator
                  strength={passwordStrength?.strength}
                  score={passwordStrength?.score}
                  message={passwordStrength?.message}
                />
              </div>
            )}

            <div>
              <label>Edad:</label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                min="18"
                max="65"
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div>
              <label>Celular:</label>
              <input
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 15 }}>
            <label>Dirección:</label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows="2"
              required
              style={{
                width: '100%',
                padding: 8,
                marginTop: 5,
                border: '1px solid #ccc',
                borderRadius: 4,
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer',
                marginRight: 10
              }}
            >
              {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Nombre</th>
              <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Correo</th>
              <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Edad</th>
              <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Celular</th>
              <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: 15 }}>
                  {employee.nombre} {employee.apellidos}
                </td>
                <td style={{ padding: 15 }}>{employee.correo}</td>
                <td style={{ padding: 15 }}>{employee.edad} años</td>
                <td style={{ padding: 15 }}>{employee.celular}</td>
                <td style={{ padding: 15 }}>
                  <button
                    onClick={() => handleEdit(employee)}
                    style={{
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: 3,
                      cursor: 'pointer',
                      marginRight: 5
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(employee._id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: 3,
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>
            No hay empleados registrados
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;