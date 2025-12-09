// controllers/paymentController.js
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_51Qt8EXAMPLE_SECRET_KEY_HERE') {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.warn('Stripe no configurado correctamente. Los pagos con tarjeta estarán deshabilitados.');
}

// Crear Payment Intent para pago con tarjeta
const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ msg: 'Pagos con tarjeta no disponibles - Stripe no configurado' });
    }

    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Monto inválido' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      payment_method_types: ['card'],
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    res.status(500).json({ msg: 'Error al crear intención de pago' });
  }
};

// Confirmar pago (opcional, ya que Stripe confirma automáticamente)
const confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ msg: 'Pagos con tarjeta no disponibles - Stripe no configurado' });
    }

    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100
    });
  } catch (err) {
    console.error('confirmPayment error:', err);
    res.status(500).json({ msg: 'Error al confirmar pago' });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};