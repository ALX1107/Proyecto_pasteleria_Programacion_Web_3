// src/components/Cart.jsx
import React from 'react';

const Cart = ({ items, total, onSaleSubmit, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="form-container" style={{ backgroundColor: 'var(--container-color-1)', padding: '20px' }}>
      <h3 style={{ borderBottom: '2px solid var(--text-dark)', paddingBottom: '10px' }}>
        Carrito de Compras
      </h3>

      {items.length === 0 ? (
        <p style={{ fontStyle: 'italic' }}>
          El carrito está vacío. Agrega productos de la lista.
        </p>
      ) : (
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginBottom: '15px',
            paddingRight: '5px',
          }}
        >
          {items.map((item) => (
            <div key={item.id} style={cartItemStyle}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{item.nombre}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
                  style={quantityInputStyle}
                />
                <span style={{ minWidth: '70px', textAlign: 'right' }}>
                  ${(item.cost * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{ ...actionButtonStyle, backgroundColor: '#f44336' }}
                  title="Quitar producto"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={totalContainerStyle}>
        <span>TOTAL:</span>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
          ${total.toFixed(2)} USD
        </span>
      </div>

      <button
        onClick={() => onSaleSubmit(total)}
        disabled={items.length === 0}
        style={checkoutButtonStyle}
      >
        Realizar Venta
      </button>
    </div>
  );
};

// Estilos Reutilizables para el Carrito
const cartItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px dotted #5cbb9a',
};

const quantityInputStyle = {
  width: '50px',
  padding: '5px',
  textAlign: 'center',
  fontFamily: 'var(--font-display)',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const actionButtonStyle = {
  border: 'none',
  color: 'white',
  padding: '5px 8px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
};

const totalContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 0',
  marginTop: '10px',
  borderTop: '2px solid var(--text-dark)',
  marginBottom: '20px',
};

const checkoutButtonStyle = {
  width: '100%',
  padding: '15px',
  backgroundColor: 'var(--container-color-2)', // Rojo para acción final de venta
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 'bold',
  fontFamily: 'var(--font-display)',
};

export default Cart;
