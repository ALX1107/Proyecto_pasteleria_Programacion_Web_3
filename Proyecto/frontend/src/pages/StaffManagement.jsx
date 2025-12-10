import React, { useEffect, useState } from 'react';
import './StaffManagement.css';
import { useAuth } from '../contexts/AuthContext';

const StaffManagement = () => {
  const { user, hasRole } = useAuth();
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const loadStaff = async () => {
    if (!user?.token || !hasRole('Admin')) return;
    try {
      const res = await fetch(`${API}/api/staff`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('No se pudo cargar el personal');
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  const handleDelete = async (id) => {
    if (!user?.token || !hasRole('Admin')) return;
    if (!window.confirm('¿Eliminar a este miembro del personal?')) return;
    try {
      const res = await fetch(`${API}/api/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayroll = async (id) => {
    if (!user?.token || !hasRole('Admin')) return;
    try {
      const res = await fetch(`${API}/api/staff/${id}/payroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('No se pudo registrar el pago');
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="staff-page">
      <div className="staff-container">
        <div className="staff-header">
          <h1>👥 Gestión de Personal</h1>
          <p>Administra el equipo de trabajo, horarios y pagos de sueldos</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {hasRole('Admin') ? (
          <div className="staff-content">
            <div className="staff-stats">
              <div className="stat-card">
                <h3>{staff.length}</h3>
                <p>Empleados Activos</p>
              </div>
              <div className="stat-card">
                <h3>Bs. {staff.reduce((total, emp) => total + (emp.sueldo || 0), 0).toLocaleString()}</h3>
                <p>Total Sueldos</p>
              </div>
            </div>

            <div className="staff-table-container">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Horario</th>
                    <th>Sueldo</th>
                    <th>Estado Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((empleado) => (
                    <tr key={empleado._id}>
                      <td className="employee-name">
                        <strong>{empleado.nombre}</strong>
                      </td>
                      <td>
                        <span className={`role-badge ${empleado.rol.toLowerCase()}`}>
                          {empleado.rol}
                        </span>
                      </td>
                      <td>{empleado.horario || 'Pendiente'}</td>
                      <td>Bs. {(empleado.sueldo || 0).toLocaleString()}</td>
                      <td>
                        <span className={`payment-status ${empleado.ultimoPago ? 'paid' : 'pending'}`}>
                          {empleado.ultimoPago ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-payroll"
                            onClick={() => handlePayroll(empleado._id)}
                            title="Registrar pago de sueldo"
                          >
                            💰 Pagar
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(empleado._id)}
                            title="Eliminar empleado"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="access-denied">
            <h2>🔒 Acceso Restringido</h2>
            <p>Solo los administradores pueden gestionar el personal.</p>
            <p>Inicia sesión como administrador para acceder a esta funcionalidad.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
