import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    costo: '',
    margenGanancia: 30,
    stock: '',
    unit: 'unidad',
    imagen: null
  });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `${API}/api/products/${editingProduct._id}`
        : `${API}/api/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      // Crear FormData para manejar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('costo', parseFloat(formData.costo));
      formDataToSend.append('stock', parseInt(formData.stock));
      formDataToSend.append('unit', formData.unit);

      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user.token}`
        
        },
        body: formDataToSend
      });

      if (!res.ok) throw new Error('Error al guardar producto');

      await fetchProducts();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const res = await fetch(`${API}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!res.ok) throw new Error('Error al eliminar producto');

      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      costo: product.costo.toString(),
      margenGanancia: product.margenGanancia || 30,
      stock: product.stock.toString(),
      unit: product.unit,
      imagen: null // No cargar imagen existente para edición
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      costo: '',
      margenGanancia: 30,
      stock: '',
      unit: 'unidad',
      imagen: null
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando productos...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>📦 Gestión de Productos</h1>
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
          {showForm ? 'Cancelar' : '+ Agregar Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#f9f9f9',
          padding: 20,
          borderRadius: 8,
          marginBottom: 20
        }}>
          <h3>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
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
              <label>Costo de Producción:</label>
              <input
                type="number"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            <div>
              <label>Margen de Ganancia (%):</label>
              <input
                type="number"
                name="margenGanancia"
                value={formData.margenGanancia}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
              <small style={{ color: '#666', fontSize: '0.9em' }}>
                Precio de venta: Bs. {formData.costo && formData.margenGanancia ?
                  (parseFloat(formData.costo) * (1 + parseFloat(formData.margenGanancia) / 100)).toFixed(2) : '0.00'}
              </small>
            </div>
            <div>
              <label>Stock:</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            <div>
              <label>Unidad:</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
                <option value="caja">Caja</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 15 }}>
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Describe el producto..."
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

          <div style={{ marginTop: 15 }}>
            <label>Imagen del producto:</label>
            <input
              type="file"
              name="imagen"
              onChange={handleChange}
              accept="image/*"
              style={{ width: '100%', padding: 8, marginTop: 5 }}
            />
            <small style={{ color: '#666', fontSize: '0.9em' }}>
              Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
            </small>
          </div>
          <div style={{ marginTop: 15 }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 5,
                cursor: 'pointer',
                marginRight: 10
              }}
            >
              {editingProduct ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                backgroundColor: '#757575',
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

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nombre</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Imagen</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Precio Venta</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Stock</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Unidad</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{product.nombre}</td>
                <td style={{ padding: 12 }}>
                  {product.imagen ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={`${API}${product.imagen}`}
                        alt={product.nombre}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(`${API}${product.imagen}`, '_blank')}
                      />
                      <span style={{ fontSize: '0.8em', color: '#666' }}>
                        {product.imagen.split('/').pop()}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>Sin imagen</span>
                  )}
                </td>
                <td style={{ padding: 12 }}>Bs. {product.precioVenta ? product.precioVenta.toLocaleString() : (product.costo * 1.3).toFixed(2)}</td>
                <td style={{ padding: 12 }}>{product.stock}</td>
                <td style={{ padding: 12 }}>{product.unit}</td>
                <td style={{ padding: 12 }}>
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      backgroundColor: '#FF9800',
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
                    onClick={() => handleDelete(product._id)}
                    style={{
                      backgroundColor: '#f44336',
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
      </div>
    </div>
  );
};

export default ProductManagement;