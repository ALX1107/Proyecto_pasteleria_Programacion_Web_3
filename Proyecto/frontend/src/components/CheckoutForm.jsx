// src/components/CheckoutForm.jsx
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Crear Payment Intent desde el backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        },
        body: JSON.stringify({ amount })
      });

      const { clientSecret } = await response.json();

      // Confirmar el pago
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        onError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10 }}>Detalles de la Tarjeta</label>
        <div style={{
          padding: 10,
          border: '1px solid #ccc',
          borderRadius: 4,
          backgroundColor: 'white'
        }}>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: processing ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: processing ? 'not-allowed' : 'pointer'
        }}
      >
        {processing ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutForm;