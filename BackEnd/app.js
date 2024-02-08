const express = require('express');
const cookieSession = require('cookie-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressAsyncErrors = require('express-async-errors');
const errorHandler = require('salahorg/middlewares/error-handler');
const NotFoundError = require('salahorg/errors/not-found-error');
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const { Order } = require('./models/order');
const { Product } = require('./models/product');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();

// Serve static files from the "client" directory
app.use(express.static("client"));

// Middleware to parse JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Enable CORS
app.use(cors());

// Trust proxy for secure connections
app.set('trust proxy', true);



// Cookie session middleware
app.use(cookieSession({
  signed: false,
  secure: false,
}));

// Cookie parser middleware
app.use(cookieParser());

// Routes
const signup = require('./routes/signup');
const signin = require('./routes/signin');
const signout = require('./routes/signout');
const forgetpassword = require('./routes/forgetpassword');
const resetpassword = require('./routes/resetpassword');
const currentUser = require('./routes/currrentuser');
const category = require('./routes/categories');
const product = require('./routes/products');
const order = require('./routes/orders');
const payment = require('./routes/payment');
const webhook = require("./routes/webhook")
const userPayments = require("./routes/userPayments")
const auctionProduct =  require("./routes/auctionProduct")
const cart = require("./routes/cart")
const user = require("./routes/user")


app.use(signup);
app.use(signin);
app.use(signout);
app.use(resetpassword);
app.use(forgetpassword);
app.use(currentUser);
app.use(category);
app.use(product);
app.use(order);
app.use(payment);
app.use(webhook);
app.use(userPayments);
app.use(auctionProduct);
app.use(cart);
app.use(user);

// Catch-all route for handling 404 errors
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
