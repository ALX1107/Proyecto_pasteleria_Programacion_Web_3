import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // Estado del carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Datos del carrusel
  const carouselSlides = [
    {
      id: 0,
      title: 'Postres Artesanales',
      description: 'Elaborados con los mejores ingredientes y mucho amor',
      buttonText: 'Ver Catálogo',
      buttonAction: () => navigate('/products'),
      bgClass: 'bg-gradient-1'
    },
    {
      id: 1,
      title: 'Tartas Personalizadas',
      description: 'Creamos el postre perfecto para tu ocasión especial',
      buttonText: 'Pedir Ahora',
      buttonAction: () => user ? navigate('/products') : navigate('/login'),
      bgClass: 'bg-gradient-2'
    },
    {
      id: 2,
      title: 'Entrega a Domicilio',
      description: 'Llevamos la dulzura directamente a tu puerta',
      showMessage: true,
      message: '📞 Llámanos al: +591 123-4567',
      bgClass: 'bg-gradient-3'
    }
  ];

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  // Efecto para el carrusel automático
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }, 5000); // Cambia cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselSlides.length]);

  // Funciones del carrusel
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
  };

  const resumeAutoPlay = () => {
    setIsAutoPlaying(true);
  };

  const loadProducts = async () => {
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

  const addToCart = (product) => {
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      const newCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(newCart);
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      saveCart(newCart);
    }
    alert('Producto agregado al carrito');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const precio = item.precioVenta || (item.costo * 1.3);
      return total + (precio * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="homepage">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Header */}
      <header className="main-header">
        <div className="header-content">
          <h1>☕ Pastelería Java</h1>
          <p>La mejor experiencia en café y postres artesanales</p>

          {user && (
            <div className="cart-summary">
              <span>🛒 {getCartItemsCount()} productos</span>
              <span>Bs. {getCartTotal().toLocaleString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Hero Carousel */}
      <section
        className="hero-carousel"
        onMouseEnter={pauseAutoPlay}
        onMouseLeave={resumeAutoPlay}
      >
        <div className="carousel-container">
          {/* Indicadores */}
          <div className="carousel-indicators">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`carousel-indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slides */}
          <div className="carousel-inner">
            {carouselSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`carousel-slide ${currentSlide === index ? 'active' : ''}`}
              >
                <div className={`carousel-bg ${slide.bgClass}`}>
                  <div className="carousel-content">
                    <h2>{slide.title}</h2>
                    <p>{slide.description}</p>
                    {slide.showMessage ? (
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#fff',
                        textAlign: 'center',
                        marginTop: '20px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        {slide.message}
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-lg carousel-btn"
                        onClick={slide.buttonAction}
                      >
                        {slide.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de navegación */}
          <button
            className="carousel-control-prev"
            type="button"
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            <span className="carousel-control-prev-icon">‹</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            onClick={nextSlide}
            aria-label="Slide siguiente"
          >
            <span className="carousel-control-next-icon">›</span>
          </button>

          {/* Barra de progreso */}
          <div className="carousel-progress">
            <div
              className="carousel-progress-bar"
              style={{
                width: `${((currentSlide + 1) / carouselSlides.length) * 100}%`
              }}
            />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="products-section">
        <div className="container">
          <h2>Nuestros Productos</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.imagen ? (
                    <img src={`${API}${product.imagen}`} alt={product.nombre} />
                  ) : (
                    <div className="no-image">🍰</div>
                  )}
                </div>

                <div className="product-info">
                  <h3>{product.nombre}</h3>
                  {product.descripcion && (
                    <p className="product-description">{product.descripcion}</p>
                  )}

                  <div className="product-details">
                    <span className="price">Bs. {product.precioVenta ? product.precioVenta.toLocaleString() : (product.costo * 1.3).toFixed(2)}</span>
                    <span className="stock">
                      Stock: {product.stock} {product.unit}
                    </span>
                  </div>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !error && (
            <div className="no-products">
              <p>No hay productos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <p>&copy; 2025 Pastelería Java. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;