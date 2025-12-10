import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SalesHistory.css';

const formatDate = (date) => new Date(date).toLocaleString('es-ES');
const formatCurrency = (amount) => `Bs. ${Number(amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

const SalesHistory = () => {
  const { user, hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'all'
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    usuario: '',
    metodoPago: '',
    cliente: ''
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchHistory = async () => {
    if (!user?.token) return;
    setLoading(true);
    setError('');

    try {
      let url = `${API}/api/sales/today`;

      if (hasRole('Admin') && viewMode === 'all') {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('fechaDesde', filters.startDate);
        if (filters.endDate) params.append('fechaHasta', filters.endDate);
        if (filters.metodoPago) params.append('metodoPago', filters.metodoPago);
        if (filters.usuario) params.append('usuario', filters.usuario);
        if (filters.cliente) params.append('cliente', filters.cliente);
        url = `${API}/api/sales?${params.toString()}`;
      }

      const res = await fetch(url, {
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
  }, [viewMode]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      usuario: '',
      metodoPago: '',
      cliente: ''
    });
    fetchHistory();
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === 'today') {
      setFilters({
        startDate: '',
        endDate: '',
        usuario: '',
        metodoPago: '',
        cliente: ''
      });
    }
  };

  const exportToPDF = async () => {
    try {
      const res = await fetch(`${API}/api/reports/sales?viewMode=${viewMode}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!res.ok) throw new Error('Error generando PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial-ventas-${viewMode}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error generando PDF: ' + err.message);
    }
  };

  const totalSales = records.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalTransactions = records.length;
  const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const isAdmin = hasRole('Admin');

  return (
    <div className="sales-history">
      <div className="sales-container">
        {/* Header */}
        <div className="sales-header">
          <div className="header-content">
            <h1>📊 Historial de Ventas</h1>
            <p>
              {isAdmin
                ? (viewMode === 'all' ? 'Vista completa del historial de ventas' : 'Ventas registradas hoy')
                : 'Tus ventas del día'
              }
            </p>
          </div>

          <div className="header-actions">
            {isAdmin && (
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'today' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('today')}
                >
                  📅 Hoy
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('all')}
                >
                  📈 Todas
                </button>
              </div>
            )}

            <button className="export-btn" onClick={exportToPDF}>
              📄 Exportar PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{formatCurrency(totalSales)}</h3>
              <p>Total Ventas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{totalTransactions}</h3>
              <p>Transacciones</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{formatCurrency(averageSale)}</h3>
              <p>Promedio por Venta</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {isAdmin && viewMode === 'all' && (
          <div className="filters-section">
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 Filtros {showFilters ? '▼' : '▶'}
            </button>

            {showFilters && (
              <form className="filters-form" onSubmit={applyFilters}>
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Fecha Desde</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Fecha Hasta</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Método de Pago</label>
                    <select
                      name="metodoPago"
                      value={filters.metodoPago}
                      onChange={handleFilterChange}
                    >
                      <option value="">Todos</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Usuario</label>
                    <input
                      type="text"
                      name="usuario"
                      value={filters.usuario}
                      onChange={handleFilterChange}
                      placeholder="Nombre del empleado"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Cliente</label>
                    <input
                      type="text"
                      name="cliente"
                      value={filters.cliente}
                      onChange={handleFilterChange}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button type="button" className="clear-btn" onClick={clearFilters}>
                    🗑️ Limpiar
                  </button>
                  <button type="submit" className="apply-btn">
                    🔍 Aplicar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Sales Table */}
        <div className="sales-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando historial...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No hay ventas registradas</h3>
              <p>
                {viewMode === 'today'
                  ? 'No se han registrado ventas hoy.'
                  : 'No se encontraron ventas con los filtros aplicados.'
                }
              </p>
            </div>
          ) : (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  {isAdmin && <th>Empleado</th>}
                  <th>Cliente</th>
                  <th>Método de Pago</th>
                  <th>Total</th>
                  <th>Productos</th>
                </tr>
              </thead>
              <tbody>
                {records.map((sale) => (
                  <tr key={sale._id}>
                    <td className="date-cell">
                      {formatDate(sale.fecha || sale.createdAt)}
                    </td>
                    {isAdmin && (
                      <td className="employee-cell">
                        {sale.usuario || 'Sistema'}
                      </td>
                    )}
                    <td className="client-cell">
                      {sale.cliente?.nombre || 'Cliente General'}
                    </td>
                    <td className="payment-cell">
                      <span className={`payment-badge ${sale.metodoPago?.toLowerCase() || 'efectivo'}`}>
                        {sale.metodoPago || 'Efectivo'}
                      </span>
                    </td>
                    <td className="total-cell">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="products-cell">
                      <div className="products-list">
                        {(sale.items || []).map((item, idx) => (
                          <div key={idx} className="product-item">
                            <span className="product-name">{item.nombre}</span>
                            <span className="product-quantity">x{item.cantidad}</span>
                            <span className="product-price">{formatCurrency(item.precio)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;