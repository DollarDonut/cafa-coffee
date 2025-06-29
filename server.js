
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const products = [
    {
        imgSrc: '/img/coffee.jpg',
        title: 'Dark roast coffee',
        description: 'A bold and bitter coffee experience',
        imgAlt: 'Coffee beans',
        price: 1250
    },
    {
        imgSrc: '/img/coffee.jpg',
        title: 'Medium roast coffee',
        description: 'A nice balance of flavor and strength',
        imgAlt: 'Coffee beans',
        price: 1250
    }
];

app.get('/', (req, res) => {
    res.render('index', { products });
});

app.post('/create-checkout-session', async (req, res) => {
    try {
        const origin = req.headers.origin || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Coffee',
                        },
                        unit_amount: 1000
                    },
                    quantity: 1
                }
            ],
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

app.get('/success', (req, res) => res.render('success'));
app.get('/cancel', (req, res) => res.render('cancel'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
