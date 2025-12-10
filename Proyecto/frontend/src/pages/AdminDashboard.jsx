import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalProductos: 0,
    totalEmpleados: 0,
    promedioGanancias: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados para gestión de empleados
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    contraseña: '',
    edad: '',
    direccion: '',
    celular: '',
    rol: 'Employee',
    horario: '9:00-18:00',
    sueldo: ''
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'employees') {
      loadEmployees();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      const token = user?.token;
      if (!token) {
        console.error('No token available');
        return;
      }

      const response = await fetch(`${API}/api/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalVentas: data.totalVentas || 0,
          totalProductos: data.totalProductos || 0,
          totalEmpleados: data.totalEmpleados || 0,
          promedioGanancias: data.promedioGanancias || 0
        });
      } else {
        console.error('Error loading dashboard data:', response.status, response.statusText);
        // Fallback to example data if API fails
        setStats({
          totalVentas: 0,
          totalProductos: 0,
          totalEmpleados: 0,
          promedioGanancias: 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to example data if API fails
      setStats({
        totalVentas: 0,
        totalProductos: 0,
        totalEmpleados: 0,
        promedioGanancias: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const token = user?.token;
      if (!token) {
        console.error('No token available');
        return;
      }

      const response = await fetch(`${API}/api/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error('Error loading employees:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      if (!token) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      const url = editingEmployee
        ? `${API}/api/staff/${editingEmployee._id}`
        : `${API}/api/staff`;

      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeFormData)
      });

      if (response.ok) {
        await loadEmployees();
        resetEmployeeForm();
      } else {
        const error = await response.json();
        alert(error.msg || 'Error al guardar empleado');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error al guardar empleado');
    }
  };

  const handleEmployeeEdit = (employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      nombre: employee.nombre || '',
      apellidos: employee.apellidos || '',
      correo: employee.correo || '',
      contraseña: '',
      edad: employee.edad ? employee.edad.toString() : '',
      direccion: employee.direccion || '',
      celular: employee.celular || '',
      rol: employee.rol || 'Employee',
      horario: employee.horario || '9:00-18:00',
      sueldo: employee.sueldo ? employee.sueldo.toString() : ''
    });
    setShowEmployeeForm(true);
  };

  const handleEmployeeDelete = async (employeeId) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
      const token = user?.token;
      if (!token) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      const response = await fetch(`${API}/api/staff/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadEmployees();
      } else {
        alert('Error al eliminar empleado');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error al eliminar empleado');
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData({
      nombre: '',
      apellidos: '',
      correo: '',
      contraseña: '',
      edad: '',
      direccion: '',
      celular: '',
      rol: 'Employee',
      horario: '9:00-18:00',
      sueldo: ''
    });
    setEditingEmployee(null);
    setShowEmployeeForm(false);
  };

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData(prev => ({ ...prev, [name]: value }));

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
    return <div style={{ padding: 20 }}>Cargando dashboard...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🏢 Dashboard Administrativo</h1>

      {/* Pestañas de navegación */}
      <div style={{ marginBottom: 30, borderBottom: '2px solid #dee2e6' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? '3px solid #007bff' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
            color: activeTab === 'dashboard' ? '#007bff' : '#666'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'employees' ? '3px solid #007bff' : '3px solid transparent',
            background: 'none',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: activeTab === 'employees' ? 'bold' : 'normal',
            color: activeTab === 'employees' ? '#007bff' : '#666'
          }}
        >
          👥 Gestionar Empleados
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>

      {/* Estadísticas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20,
        marginBottom: 40
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: 20,
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <h3>Total Ventas</h3>
          <h2>Bs. {stats.totalVentas.toLocaleString()}</h2>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: 20,
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <h3>Productos</h3>
          <h2>{stats.totalProductos}</h2>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: 20,
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <h3>Empleados</h3>
          <h2>{stats.totalEmpleados}</h2>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: 20,
          borderRadius: 10,
          textAlign: 'center'
        }}>
          <h3>Ganancias Promedio</h3>
          <h2>Bs. {stats.promedioGanancias.toLocaleString()}</h2>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 30
      }}>
        {/* Gráfico de productos más vendidos (donut) */}
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Productos Más Vendidos</h3>
          <div style={{
            width: 300,
            height: 300,
            margin: '0 auto',
            background: 'conic-gradient(#ff6384 0% 35%, #36a2eb 35% 65%, #cc65fe 65% 85%, #ffce56 85% 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: 150,
              height: 150,
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: 24, fontWeight: 'bold' }}>35%</span>
            </div>
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#ff6384', borderRadius: 2 }}></div>
                <span>Tarta Fresa (35%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#36a2eb', borderRadius: 2 }}></div>
                <span>Muffin Chocolate (30%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#cc65fe', borderRadius: 2 }}></div>
                <span>Macarons (20%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#ffce56', borderRadius: 2 }}></div>
                <span>Pan Masa Madre (15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de ventas por empleado (barras) */}
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Ventas por Empleado</h3>
          <div style={{ height: 300, display: 'flex', alignItems: 'end', justifyContent: 'space-around', padding: '20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 40,
                height: 200,
                background: 'linear-gradient(to top, #667eea, #764ba2)',
                borderRadius: '4px 4px 0 0',
                marginBottom: 5
              }}></div>
              <span style={{ fontSize: 12, textAlign: 'center' }}>Juan<br/>Bs. 45,000</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 40,
                height: 160,
                background: 'linear-gradient(to top, #f093fb, #f5576c)',
                borderRadius: '4px 4px 0 0',
                marginBottom: 5
              }}></div>
              <span style={{ fontSize: 12, textAlign: 'center' }}>María<br/>Bs. 36,000</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 40,
                height: 180,
                background: 'linear-gradient(to top, #4facfe, #00f2fe)',
                borderRadius: '4px 4px 0 0',
                marginBottom: 5
              }}></div>
              <span style={{ fontSize: 12, textAlign: 'center' }}>Carlos<br/>Bs. 40,500</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 40,
                height: 140,
                background: 'linear-gradient(to top, #43e97b, #38f9d7)',
                borderRadius: '4px 4px 0 0',
                marginBottom: 5
              }}></div>
              <span style={{ fontSize: 12, textAlign: 'center' }}>Ana<br/>Bs. 31,500</span>
            </div>
          </div>
        </div>

        {/* Gráfico de ventas por meses (barras) */}
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Ventas por Mes</h3>
          <div style={{ height: 300, display: 'flex', alignItems: 'end', justifyContent: 'space-around', padding: '20px 0' }}>
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((mes, index) => (
              <div key={mes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 35,
                  height: 80 + (index * 20),
                  background: 'linear-gradient(to top, #667eea, #764ba2)',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: 5
                }}></div>
                <span style={{ fontSize: 12 }}>{mes}</span>
                <span style={{ fontSize: 10, color: '#666' }}>Bs. {(15 + index * 5).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de ganancias por meses (torta) */}
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Ganancias por Mes</h3>
          <div style={{
            width: 300,
            height: 300,
            margin: '0 auto',
            background: 'conic-gradient(#4caf50 0% 40%, #2196f3 40% 70%, #ff9800 70% 90%, #f44336 90% 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: 150,
              height: 150,
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: 24, fontWeight: 'bold' }}>40%</span>
            </div>
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#4caf50', borderRadius: 2 }}></div>
                <span>Enero (40%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#2196f3', borderRadius: 2 }}></div>
                <span>Febrero (30%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#ff9800', borderRadius: 2 }}></div>
                <span>Marzo (20%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#f44336', borderRadius: 2 }}></div>
                <span>Abril (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      ) : (
        /* Gestión de Empleados */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>👥 Gestión de Empleados</h2>
            <button
              onClick={() => setShowEmployeeForm(!showEmployeeForm)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              {showEmployeeForm ? 'Cancelar' : '+ Agregar Empleado'}
            </button>
          </div>

          {showEmployeeForm && (
            <form onSubmit={handleEmployeeSubmit} style={{
              backgroundColor: '#f8f9fa',
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
                    value={employeeFormData.nombre}
                    onChange={handleEmployeeFormChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>

                <div>
                  <label>Apellidos:</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={employeeFormData.apellidos}
                    onChange={handleEmployeeFormChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>

                <div>
                  <label>Correo:</label>
                  <input
                    type="email"
                    name="correo"
                    value={employeeFormData.correo}
                    onChange={handleEmployeeFormChange}
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
                      value={employeeFormData.contraseña}
                      onChange={handleEmployeeFormChange}
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
                    value={employeeFormData.edad}
                    onChange={handleEmployeeFormChange}
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
                    value={employeeFormData.celular}
                    onChange={handleEmployeeFormChange}
                    required
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>

                <div>
                  <label>Rol:</label>
                  <select
                    name="rol"
                    value={employeeFormData.rol}
                    onChange={handleEmployeeFormChange}
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  >
                    <option value="Employee">Empleado</option>
                    <option value="Admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label>Horario:</label>
                  <input
                    type="text"
                    name="horario"
                    value={employeeFormData.horario}
                    onChange={handleEmployeeFormChange}
                    placeholder="Ej: 9:00-18:00"
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>

                <div>
                  <label>Sueldo (Bs.):</label>
                  <input
                    type="number"
                    name="sueldo"
                    value={employeeFormData.sueldo}
                    onChange={handleEmployeeFormChange}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: 8, marginTop: 5 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 15 }}>
                <label>Dirección:</label>
                <textarea
                  name="direccion"
                  value={employeeFormData.direccion}
                  onChange={handleEmployeeFormChange}
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
                  onClick={resetEmployeeForm}
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
                  <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Rol</th>
                  <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Sueldo</th>
                  <th style={{ padding: 15, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Estado</th>
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
                    <td style={{ padding: 15 }}>
                      <span style={{
                        backgroundColor: employee.rol === 'Admin' ? '#dc3545' : '#28a745',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: 12
                      }}>
                        {employee.rol}
                      </span>
                    </td>
                    <td style={{ padding: 15 }}>Bs. {employee.sueldo?.toLocaleString()}</td>
                    <td style={{ padding: 15 }}>
                      <span style={{
                        color: employee.activo ? '#28a745' : '#dc3545',
                        fontWeight: 'bold'
                      }}>
                        {employee.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: 15 }}>
                      <button
                        onClick={() => handleEmployeeEdit(employee)}
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
                        onClick={() => handleEmployeeDelete(employee._id)}
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
      )}
    </div>
  );
};

export default AdminDashboard;