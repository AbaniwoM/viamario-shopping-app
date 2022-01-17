const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


const app = express();

// Passport config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;
const { response } = require('express');
// const passport = require('./config/passport');

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
   .then(() => console.log('MongoDB Connected...'))
   .catch(err => console.log(err));



// // EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser 
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Images
app.use( express.static( "public" ) );

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is running on port ${PORT}`));

require("dotenv").config();


app.use(express.json());

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

//Store Items
const storeItems = new Map([[
    1, { priceInNaira: 5000, name: 'Sneakers'}],
    [2, { priceInNaira: 2000, name: 'Sandals'}],
]);

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'NGN',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInNaira
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url:  `${process.env.SERVER_URL}/cancel.html`
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})
