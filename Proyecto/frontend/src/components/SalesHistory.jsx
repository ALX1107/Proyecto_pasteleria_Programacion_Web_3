import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const formatDate = (date) => new Date(date).toLocaleString();

const SalesHistory = ({ title = 'Historial de ventas', scope = 'worker' }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    usuario: '',
    metodoPago: ''
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchHistory = async () => {
    if (!user?.token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.metodoPago) params.append('metodoPago', filters.metodoPago);
      if (filters.usuario && user.rol === 'Admin') {
        params.append('usuario', filters.usuario);
      }

      const res = await fetch(`${API}/api/stats/sales-history?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo obtener el historial');
      const data = await res.json();
      setRecords(data || []);
    } catch (err) {
      setError(err.message || 'Error consultando historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <section
      style={{
        marginTop: 24,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <p style={{ marginTop: 4, color: '#555' }}>
            {scope === 'admin'
              ? 'Filtra por fecha, usuario o método de pago.'
              : 'Ventas registradas durante tu jornada.'}
          </p>
        </div>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
            Desde
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="styled-input"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
            Hasta
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="styled-input"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
            Método
            <select
              name="metodoPago"
              value={filters.metodoPago}
              onChange={handleChange}
              className="styled-input"
            >
              <option value="">Todos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </label>
          {user?.rol === 'Admin' && (
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
              Usuario
              <input
                type="text"
                name="usuario"
                value={filters.usuario}
                onChange={handleChange}
                placeholder="Nombre o correo"
                className="styled-input"
              />
            </label>
          )}
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>
            Filtrar
          </button>
        </form>
      </div>

      {error && <p style={{ color: 'var(--container-color-2)' }}>{error}</p>}
      {loading ? (
        <p>Cargando historial...</p>
      ) : records.length === 0 ? (
        <p style={{ color: '#777' }}>No hay ventas registradas para los filtros seleccionados.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--container-color-1)' }}>
                <th style={{ padding: 10, textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Usuario</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Método</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Total</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {records.map((sale) => (
                <tr key={sale._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 10 }}>{formatDate(sale.createdAt)}</td>
                  <td style={{ padding: 10 }}>{sale.usuario || '—'}</td>
                  <td style={{ padding: 10 }}>{sale.metodoPago || 'Efectivo'}</td>
                  <td style={{ padding: 10 }}>${Number(sale.total || 0).toFixed(2)}</td>
                  <td style={{ padding: 10 }}>
                    {(sale.items || []).map((item, idx) => (
                      <div key={idx} style={{ color: '#444' }}>
                        {item.nombre} ({item.cantidad}) - ${item.precio}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default SalesHistory;
