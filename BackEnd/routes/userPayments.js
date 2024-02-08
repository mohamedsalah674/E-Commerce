// userPaymentsRoute.js
const express = require('express');
const router = express.Router();
const { Payment } = require('../models/payment');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const { Product } = require('../models/product');

// Retrieve all payments for a specific user
router.get('/userPayments/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Retrieve all orders associated with the user
        const userOrders = await Order.find({ user: userId });

        // Extract order IDs
        const orderIds = userOrders.map(order => order._id);

        // Retrieve all payments associated with the user's orders, populating the 'order' field
        const userPayments = await Payment.find({ order: { $in: orderIds } }).populate('order');

        // Additional step: Populate the 'order.orderItems' array to get the associated order items
        const populatedPayments = await Payment.populate(userPayments, { path: 'order.orderItems' });

        // Additional step: Populate the 'order.orderItems.product' field to get the associated products
        const formattedPayments = await Promise.all(populatedPayments.map(async payment => {
            const formattedOrderItems = await Promise.all(payment.order.orderItems.map(async orderItem => {
                const product = await Product.findById(orderItem.product);
                return {
                    product: product,
                    quantity: orderItem.quantity,
                };
            }));
        
            return {
                _id: payment._id,
                order: {
                    _id: payment.order._id,
                    orderItems: formattedOrderItems,
                    // Add other relevant order fields if needed
                },
                paymentMethod: payment.paymentMethod,
                paymentStatus: payment.paymentStatus,
                amount: payment.amount,
                currency: payment.currency,
                paymentDate: payment.paymentDate,
            };
        }));
        
        res.status(200).json(formattedPayments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
