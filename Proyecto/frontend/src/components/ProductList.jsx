// src/components/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProductList = ({
  products = [],
  onAddToCart = () => {},
  onSaleCompleted = () => {}
}) => {
  const [localProducts, setLocalProducts] = useState(products);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [paymentType, setPaymentType] = useState('Efectivo');

  const { user } = useAuth();

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const findProduct = (id) =>
    (localProducts || []).find((p) => p.id === id || p._id === id);

  const addToCart = (product) => {
    const pid = product.id || product._id;
    const p = findProduct(pid);
    if (!p || (typeof p.stock === 'number' && p.stock <= 0)) return;

    // Descontar stock localmente
    setLocalProducts((prev) =>
      prev.map((x) =>
        x.id === pid || x._id === pid
          ? { ...x, stock: (x.stock || 0) - 1 }
          : x
      )
    );

    setCart((prev) => {
      const existing = prev.find((i) => i.id === pid);
      if (existing) {
        return prev.map((i) =>
          i.id === pid ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: pid,
          nombre: product.nombre || '-',
          costo: product.costo || 0,
          qty: 1
        }
      ];
    });

    onAddToCart(product);
  };

  const removeFromCart = (itemId) => {
    const item = cart.find((i) => i.id === itemId);
    if (!item) return;

    // Devolver stock al inventario local
    setLocalProducts((prev) =>
      prev.map((x) =>
        x.id === itemId || x._id === itemId
          ? { ...x, stock: (x.stock || 0) + item.qty }
          : x
      )
    );

    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const changeQty = (itemId, delta) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const newQty = i.qty + delta;
        if (newQty <= 0) return i;
        return { ...i, qty: newQty };
      })
    );

    setLocalProducts((prev) =>
      prev.map((x) => {
        if (!(x.id === itemId || x._id === itemId)) return x;
        return { ...x, stock: (x.stock || 0) - delta };
      })
    );
  };

  const checkout = async () => {
    if (cart.length === 0) {
      setMessage('El carrito está vacío.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    if (!user || !user.token) {
      setMessage('Debe iniciar sesión para completar la venta.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const items = cart.map((it) => ({
      nombre: it.nombre,
      cantidad: it.qty,
      precio: it.costo
    }));
    const total = Number(
      cart.reduce((s, it) => s + it.costo * it.qty, 0).toFixed(2)
    );

    try {
      const res = await fetch(`${API}/api/stats/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ items, total, metodoPago: paymentType })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Error al registrar la venta');
      }

      setCart([]);
      setMessage('Venta registrada correctamente.');
      setTimeout(() => setMessage(''), 3000);

      // 🔁 Pedirle al padre que recargue productos y stats desde la BD
      onSaleCompleted();
    } catch (err) {
      console.error('Checkout error:', err);
      setMessage(err.message || 'Error al procesar la venta');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  // Ordenar productos por stock (de mayor a menor) al mostrarlos
  const sortedLocalProducts = (localProducts || [])
    .slice()
    .sort((a, b) => (b.stock || 0) - (a.stock || 0));

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Inventario */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <h3
          style={{
            borderBottom: '2px solid var(--container-color-1)',
            paddingBottom: '10px'
          }}
        >
          Inventario de Productos
        </h3>

        {(!sortedLocalProducts || sortedLocalProducts.length === 0) && (
          <p style={{ padding: '10px', color: '#666' }}>
            No hay productos disponibles.
          </p>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--container-color-1)',
                color: 'var(--text-dark)'
              }}
            >
              <th style={tableHeaderStyle}>Producto</th>
              <th style={tableHeaderStyle}>Costo</th>
              <th style={tableHeaderStyle}>Stock</th>
              <th style={tableHeaderStyle}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {sortedLocalProducts.map((product) => {
              const costo =
                typeof product.costo === 'number' ? product.costo : 0;
              const stock =
                typeof product.stock === 'number' ? product.stock : 0;
              const pid = product.id || product._id;

              return (
                <tr key={pid || Math.random()} style={tableRowStyle}>
                  <td style={tableCellStyle}>{product.nombre || '-'}</td>
                  <td style={tableCellStyle}>${costo.toFixed(2)}</td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color:
                          stock < 10
                            ? 'var(--container-color-2)'
                            : 'green'
                      }}
                    >
                      {stock} {product.unit || ''}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={stock === 0}
                      style={
                        stock > 0 ? primaryButtonStyle : disabledButtonStyle
                      }
                    >
                      {stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Carrito */}
      <div
        style={{
          width: 360,
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Carrito de Venta</h3>
        {message && (
          <div style={{ marginBottom: 8, color: 'green' }}>{message}</div>
        )}
        {cart.length === 0 ? (
          <p style={{ color: '#666' }}>El carrito está vacío.</p>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Producto</th>
                  <th style={tableHeaderStyle}>Cant.</th>
                  <th style={tableHeaderStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{item.nombre}</td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => {
                          changeQty(item.id, -1);
                          if (item.qty - 1 <= 0) {
                            removeFromCart(item.id);
                          }
                        }}
                        style={{ marginRight: 6 }}
                      >
                        -
                      </button>
                      {item.qty}
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        style={{ marginLeft: 6 }}
                      >
                        +
                      </button>
                    </td>
                    <td style={tableCellStyle}>
                      ${(item.costo * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <strong>Total:</strong>
              <strong>
                $
                {cart
                  .reduce((s, it) => s + it.costo * it.qty, 0)
                  .toFixed(2)}
              </strong>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <select
                className="styled-input"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                style={{ minWidth: 140 }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <button onClick={checkout} className="btn-primary">
                Cobrar
              </button>
              <button
                onClick={() => {
                  setCart([]);
                  setLocalProducts(products);
                }}
                className="btn-secondary"
              >
                Vaciar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos
const tableHeaderStyle = {
  padding: '10px',
  textAlign: 'left',
  fontWeight: 'bold'
};
const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd'
};
const tableRowStyle = {
  transition: 'background-color 0.3s'
};

const primaryButtonStyle = {
  backgroundColor: 'var(--container-color-1)',
  color: 'var(--text-dark)',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontFamily: 'var(--font-display)',
  fontWeight: 'bold'
};

const disabledButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#ccc',
  cursor: 'not-allowed'
};

export default ProductList;
