const express = require('express');
const router = express.Router();
const { Order } = require('../models/order');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion:  '2023-10-16',
});


router.post("/process-payment/:orderId", async (req, res) => {
    try {

        const orderId = req.params.orderId;
        console.log("Order ID:", orderId);

        const customer = await stripe.customers.create({
            metadata: {
              orderId: orderId,
              currency: "USD"

            },
          });


        const order = await Order.findById(orderId);
        console.log("Order:", order);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Invalid order status for payment" });
        }
        const populatedOrder = await Order.findById(orderId).populate('user');

        // console.log("populatedOrder:  " , populatedOrder);
        // console.log("populatedOrderName:   " , populatedOrder.name);
        console.log('OrderId:', orderId);

        const session = await stripe.checkout.sessions.create({
            metadata: {
                orderId: orderId,
                currency: "USD",

              },
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Order Total for ${populatedOrder.user.name}`,
                    },
                    unit_amount: order.totalPrice * 100, // Assuming totalPrice is in dollars
                },
                quantity: 1,
            }],
            success_url: `http://localhost:3000/orders`,
            cancel_url: `http://localhost:3000/orders`,
            customer: customer.id

        });

        console.log("Checkout Session Metadata:", session.metadata);

        res.json({
            url: session.url,
            success: true,
            message: "Redirecting to payment",
            sessionId: session.id,
            paymentStatus: "Pending",

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
