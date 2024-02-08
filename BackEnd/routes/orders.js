const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();
const {Product} = require('../models/product');
const BadRequestError = require('salahorg/errors/bad-request-error');
const { AuctionProduct } = require('../models/auctionProduct');

router.get(`/orders/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/orders/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    else{res.send(order)}
})

router.post('/orders/', async (req, res) => {
    try {
        const userId = req.body.user; // Replace with the actual user ID or fetch it from your authentication system

        // Validate user and shipping details
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (!req.body.shippingAddress1) {
            return res.status(400).json({ error: 'Shipping Address 1 is required' });
        }

        let invalidQuantityProduct = null;

        // Check if any product has an invalid quantity
        for (const orderItem of req.body.orderItems) {
            let productToBeBoughtId = orderItem.product;
            let productToBeBought = await Product.findById(productToBeBoughtId);

            console.log('Product ID:', productToBeBoughtId);
            console.log('Product:', productToBeBought);
            console.log('Order Item Quantity:', orderItem.quantity);
            
            if (
                !(
                    productToBeBought &&
                    productToBeBought.countInStock >= orderItem.quantity &&
                    productToBeBought.countInStock > 0 &&
                    productToBeBought.countInStock <= 255
                )
            ) {
                invalidQuantityProduct = productToBeBoughtId;
                break;
            }
        }

        if (invalidQuantityProduct) {
            return res.status(400).json({ error: "Invalid quantity for product" });
        }

        // Create new order items
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            // Save the newOrderItem to the database
            newOrderItem = await newOrderItem.save();

            // Return the newOrderItem ID
            return newOrderItem._id;
        }));

        // Calculate Actual price
        const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        }));

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: "Pending",
            totalPrice: totalPrice,
            user: userId, // Assigning the user ID to the order
        });

        order = await order.save();

        if (!order)
            return res.status(400).send('The order cannot be created!');

        res.send({ order, orderId: order._id }); // Sending both order and orderId in the response
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



router.put('/orders/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})



router.post('/updateOrder/:orderId', async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { shippingAddress1, shippingAddress2, city, zip, country, phone } = req.body;
  
      // Update order details in the database
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            shippingAddress1: shippingAddress1,
            shippingAddress2: shippingAddress2,
            city: city,
            zip: zip,
            country: country,
            phone: phone,
          },
        },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Optionally, you can send the updated order details in the response
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


router.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order && order.status === 'Pending') {
            await Promise.all(order.orderItems.map(async (orderItem) => {
                const orderItemDetails = await OrderItem.findByIdAndRemove(orderItem);

                if (orderItemDetails) {
                    const product = await Product.findById(orderItemDetails.product);

                    if (product) {
                        await Product.findByIdAndUpdate(
                            product._id,
                            { $inc: { countInStock: orderItemDetails.quantity } },
                            { new: true }
                        );
                    }
                }
            }));

            await Order.findByIdAndRemove(req.params.id);

            return res.status(200).json({ success: true, message: 'The order is deleted, and product stock is updated!' });
        } else if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found!' });
        } else {
            return res.status(400).json({ success: false, message: 'Order status is not Pending; cannot delete!' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.get(`/orders/get/userorders/:userid`, async (req, res) => {
    try {
        const userOrderList = await Order.find({ user: req.params.userid })
            .populate({
                path: 'orderItems',
                populate: [
                    { path: 'product', model: 'Product' },
                    { path: 'auctionProduct', model: 'AuctionProduct' }
                ]
            })
            .sort({ 'dateOrdered': -1 });

        if (!userOrderList) {
            console.error('No user order list found');
            return res.status(500).json({ success: false, error: 'No user order list found' });
        }

        const formattedUserOrderList = userOrderList.map(order => ({
            ...order.toObject(),
            orderItems: order.orderItems.map(orderItem => ({
                _id: orderItem._id,
                product: orderItem.product,
                auctionProduct: orderItem.auctionProduct,
                quantity: orderItem.quantity,
                price: orderItem.price,
            })),
        }));

        res.send(formattedUserOrderList);
    } catch (error) {
        console.error('Error retrieving user orders:', error);
        res.status(500).json({ success: false, error: 'Error retrieving user orders', details: error.message });
    }
});







module.exports =router;