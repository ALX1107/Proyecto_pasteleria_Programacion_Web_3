// src/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Clave pública de Stripe (debe estar en .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;