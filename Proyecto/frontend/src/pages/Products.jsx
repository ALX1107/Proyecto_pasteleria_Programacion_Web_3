import React, { useEffect, useState } from 'react';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    cliente: { nombre: '', ci: '', telefono: '', direccion: '' },
    metodoPago: 'Efectivo'
  });
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const addToCart = (product, quantity = 1) => {
    if (quantity <= 0 || quantity > product.stock) return;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === product._id);
      let newCart;
      if (existing) {
        newCart = prevCart.map(item =>
          item.productId === product._id
            ? { ...item, cantidad: Math.min(item.cantidad + quantity, product.stock) }
            : item
        );
      } else {
        newCart = [...prevCart, {
          productId: product._id,
          nombre: product.nombre,
          precio: product.costo,
          cantidad: quantity,
          stock: product.stock
        }];
      }
      saveCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.productId !== productId);
      saveCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      saveCart([]);
      setCart([]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.productId === productId
          ? { ...item, cantidad: Math.min(newQuantity, item.stock) }
          : item
      );
      saveCart(newCart);
      return newCart;
    });
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('cliente.')) {
      const field = name.split('.')[1];
      setCheckoutData(prev => ({
        ...prev,
        cliente: { ...prev.cliente, [field]: value }
      }));
    } else {
      setCheckoutData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCompleteSale = async () => {
    if (!checkoutData.cliente.nombre.trim()) {
      alert('El nombre del cliente es obligatorio');
      return;
    }

    setProcessing(true);
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      }));

      const saleData = {
        items,
        metodoPago: checkoutData.metodoPago,
        cliente: checkoutData.cliente
      };

      // Determinar la ruta y headers según si el usuario está autenticado como empleado
      const isEmployee = user && user.type !== 'customer';
      const endpoint = isEmployee ? `${API}/api/sales` : `${API}/api/sales/customer`;
      const headers = {
        'Content-Type': 'application/json'
      };

      if (isEmployee) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(saleData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Error al procesar la venta');
      }

      const sale = await res.json();
      alert('Venta completada exitosamente!');

      // Descargar recibo PDF
      const pdfHeaders = {};
      if (isEmployee) {
        pdfHeaders.Authorization = `Bearer ${user.token}`;
      }

      const pdfRes = await fetch(`${API}/api/sales/${sale.sale._id}/pdf`, {
        headers: pdfHeaders
      });
      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_${sale.sale._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      saveCart([]);
      setCart([]);
      setShowCheckout(false);
      setCheckoutData({
        cliente: { nombre: '', ci: '', telefono: '', direccion: '' },
        metodoPago: 'Efectivo'
      });

      // Recargar productos para actualizar stock
      fetchProducts();

    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando productos...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Tienda Virtual - Productos Disponibles</h1>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Lista de productos */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2>Productos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
            {products.map(product => (
              <div key={product._id} style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 15,
                backgroundColor: 'white'
              }}>
                {product.imagen && (
                  <img
                    src={`${API}${product.imagen}`}
                    alt={product.nombre}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: 4,
                      marginBottom: 10,
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(`${API}${product.imagen}`, '_blank')}
                  />
                )}
                <h3>{product.nombre}</h3>
                <p>Precio: ${product.costo}</p>
                <p>Stock: {product.stock} {product.unit}</p>

                {product.stock > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      defaultValue="1"
                      id={`quantity-${product._id}`}
                      style={{ width: 60, marginRight: 10 }}
                    />
                    <button
                      onClick={() => {
                        const quantityInput = document.getElementById(`quantity-${product._id}`);
                        const quantity = parseInt(quantityInput.value) || 1;
                        if (quantity > 0 && quantity <= product.stock) {
                          addToCart(product, quantity);
                        }
                      }}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                ) : (
                  <p style={{ color: 'red' }}>Sin stock</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div style={{
          width: 300,
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 15,
          backgroundColor: 'white',
          height: 'fit-content'
        }}>
          <h2>Carrito de Compras</h2>

          {cart.length === 0 ? (
            <p>El carrito está vacío</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.productId} style={{
                  borderBottom: '1px solid #eee',
                  padding: '10px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <br />
                    <small>${item.precio} x {item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}</small>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.cantidad}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                      style={{ width: 50, marginRight: 5 }}
                    />
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                      title="Quitar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: 15,
                paddingTop: 15,
                borderTop: '1px solid #ddd',
                fontWeight: 'bold'
              }}>
                Total: ${getTotal().toFixed(2)}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  style={{
                    flex: 1,
                    backgroundColor: cart.length === 0 ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: 4,
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 14
                  }}
                >
                  🗑️ Vaciar Carrito
                </button>
                <button
                  onClick={() => setShowCheckout(true)}
                  disabled={cart.length === 0}
                  style={{
                    flex: 1,
                    backgroundColor: cart.length === 0 ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: 4,
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 14
                  }}
                >
                  💳 Proceder al Pago
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Checkout */}
      {showCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 8,
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2>Completar Venta</h2>

            <div style={{ marginBottom: 20 }}>
              <h3>Resumen del Carrito</h3>
              {cart.map(item => (
                <div key={item.productId} style={{ marginBottom: 10 }}>
                  {item.nombre} x {item.cantidad} = ${(item.precio * item.cantidad).toFixed(2)}
                </div>
              ))}
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>
                Total: ${getTotal().toFixed(2)}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3>Datos del Cliente</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  type="text"
                  name="cliente.nombre"
                  placeholder="Nombre del cliente *"
                  value={checkoutData.cliente.nombre}
                  onChange={handleCheckoutChange}
                  required
                  style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                />
                <input
                  type="text"
                  name="cliente.ci"
                  placeholder="CI/NIT"
                  value={checkoutData.cliente.ci}
                  onChange={handleCheckoutChange}
                  style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                />
                <input
                  type="text"
                  name="cliente.telefono"
                  placeholder="Teléfono"
                  value={checkoutData.cliente.telefono}
                  onChange={handleCheckoutChange}
                  style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                />
                <input
                  type="text"
                  name="cliente.direccion"
                  placeholder="Dirección"
                  value={checkoutData.cliente.direccion}
                  onChange={handleCheckoutChange}
                  style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3>Método de Pago</h3>
              <select
                name="metodoPago"
                value={checkoutData.metodoPago}
                onChange={handleCheckoutChange}
                style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, width: '100%' }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            {checkoutData.metodoPago === 'Tarjeta' && (
              <div style={{ marginBottom: 20 }}>
                <CheckoutForm
                  amount={getTotal()}
                  onSuccess={() => handleCompleteSale()}
                  onError={(error) => setPaymentError(error)}
                />
                {paymentError && <p style={{ color: 'red' }}>{paymentError}</p>}
              </div>
            )}

            {checkoutData.metodoPago !== 'Tarjeta' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCompleteSale}
                  disabled={processing}
                  style={{
                    flex: 1,
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: 4,
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Procesando...' : 'Completar Venta'}
                </button>
                <button
                  onClick={() => setShowCheckout(false)}
                  disabled={processing}
                  style={{
                    flex: 1,
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: 4,
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {checkoutData.metodoPago === 'Tarjeta' && (
              <button
                onClick={() => setShowCheckout(false)}
                style={{
                  width: '100%',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
