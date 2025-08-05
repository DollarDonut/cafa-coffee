require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const products = require('./data/products');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('index', { products });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});



app.post('/create-checkout-session', async (req, res) => {
  const { cart } = req.body;
  console.log('Cart received:', cart);

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart must be a non-empty array' });
  }

  const line_items = cart.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: { name: item.name },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  try {
    const origin = req.headers.origin || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/cancel', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Cancelled</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="flex items-center justify-center h-screen bg-orange-100 text-center text-red-600">
      <div>
        <h1 class="text-3xl font-semibold mb-4">Payment Cancelled</h1>
        <p class="mb-6">Please try again later.</p>
        <a href="/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Return to Home
        </a>
      </div>
    </body>
    </html>
  `);
});

app.get('/success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Success</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="flex items-center justify-center h-screen bg-orange-100 text-center text-red-600">
      <div>
        <h1 class="text-3xl font-semibold mb-4">Payment Complete</h1>
        <p class="mb-6">Thank you for your purchase.</p>
        <a href="/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Return to Home
        </a>
      </div>
    </body>
    </html>
  `);
});



app.get('/success', (req, res) => res.render('success'));
app.get('/cancel', (req, res) => res.render('cancel'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));