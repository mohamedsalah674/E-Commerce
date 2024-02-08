const { Order } = require('../models/order');
const { Product } = require('../models/product');
const { OrderItem } = require('../models/order-item');
const { Payment } = require('../models/payment');

const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion: '2023-10-16',
});

// Middleware to parse raw request body for webhooks
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    let webhookSecret ;
    let data;
    let eventType;
    let event;


    webhookSecret = process.env.STRIPE_ENDPOINT_SECRET;
try{

        // Retrieve the event by verifying the signature using the raw body and secret.
        let signature = req.headers["stripe-signature"];
  
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
          );
        } catch (err) {
          console.log(`⚠️  Webhook signature verification failed:  ${err}`);
          return res.sendStatus(400);
        }
        // Extract the object from the event.
        data = event.data.object;
        eventType = event.type;
 


        console.log("Webhook Event:", event);
        console.log("Data :  --> " , data);
        if (event.type === 'payment_intent.succeeded') {
            console.log("Inside ifffffff");
            stripe.customers
            .retrieve(data.customer)
            .then(async (customer) => {
              try {
                console.log("Customer:  --> " , customer);
                // CREATE ORDER
                const orderId = customer.metadata.orderId;
                console.log("orderIdeeee:  " , orderId);

                await Order.findByIdAndUpdate(orderId, { status: 'Processed' });

                // CREATE PAYMENT RECORD
                const paymentData = {
                  order: orderId,
                  paymentMethod: 'Stripe',
                  paymentStatus: 'Completed',
                  amount : data.amount / 100 ,
                  currency : customer.metadata.currency
              };
                const payment = new Payment(paymentData);
                await payment.save();

                console.log('Payment record created successfully!' , payment);
                const order = await Order.findById(orderId);
                console.log("Order:", order);
    
                for (const item of order.orderItems) {
                    const orderItem = await OrderItem.findById(item);
                
                    console.log('orderItem:', orderItem); // Check if orderItem is found
                    console.log("Item.orderItem --- > " , item );
                    
                    if (orderItem) {
                        await Product.findByIdAndUpdate(
                            orderItem.product, // Use the correct property from orderItem
                            { $inc: { countInStock: -orderItem.quantity } },
                            { new: true }
                        );
                    }
                }
    
                console.log('PaymentIntent was successful!');
    

              } catch (err) {
                console.log(typeof createOrder);
                console.log(err);
              }
            })
            .catch((err) => console.log(err.message));

            // Perform actions related to payment success
            // For example, update your order status or perform other relevant actions

            // Update product stock, if applicable
                   }

        // Add other event types if needed
        console.log("Webhook processing completed");

    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    res.status(200).send('Webhook Received');
});
module.exports = router;
