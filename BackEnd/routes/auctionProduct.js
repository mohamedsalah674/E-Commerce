const express = require('express');
const router = express.Router();
const { AuctionProduct } = require('../models/auctionProduct');
const cron = require('node-cron');
const { Order } = require('../models/order');
const moment = require('moment-timezone');
const User = require('../models/users');
const { OrderItem } = require('../models/order-item');
const mongoose = require('mongoose');

// cron.schedule('* * * * *', async () => {
//     console.log('Running cron job...');

//     try {
//         const auctionProductIds = await AuctionProduct.find({}).distinct('_id');
//         console.log("auctionProductIds --> : ", auctionProductIds);

//         const orders = await Order.aggregate([
//             {
//                 $match: {
//                     'orderItems': { $exists: true },
//                     status: 'Pending',
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'orderitems',
//                     localField: 'orderItems',
//                     foreignField: '_id',
//                     as: 'orderItems',
//                 },
//             },
//             {
//                 $unwind: '$orderItems',
//             },
            
//             {
//                 $lookup: {
//                     from: 'auctionproducts',
//                     let: { auctionProductId: '$orderItems.auctionProduct' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $eq: ['$_id', '$$auctionProductId'] },
//                             },
//                         },
//                     ],
//                     as: 'auctionProduct',
//                 },
//             },
//             {
//                 $unwind: '$auctionProduct',
//             },
//             {
//                 $unwind: '$user',
//             },
//             {
//                 $project: {
//                     orderItems: 1,
//                     dateOrdered: 1,
//                     paymentDeadline: "$auctionProduct.paymentDeadline", // Correctly project paymentDeadline
//                     user: 1
//                     // ... (other fields you need)
//                 },
//             },
//         ]);

//         console.log("Orders -- > ", orders);

//         const currentTime = moment();

//         await Promise.all(orders.map(async (order) => {
//             if (order.orderItems) {
//                 console.log('Processing order:', order._id);
        
//                 const orderItemsArray = Array.isArray(order.orderItems) ? order.orderItems : [order.orderItems];
//                 console.log('orderItemsArray:', orderItemsArray);

//                 // Calculate the deadline by adding paymentDeadline to the order's starting date
//                 const orderDeadline = moment(order.dateOrdered).add(order.paymentDeadline, 'hours');

//                 // Check if the order deadline is in the future
//                 if (orderDeadline.isAfter(currentTime)) {
//                     const bannedAuctionProducts = [];

//                     await Promise.all(orderItemsArray.map(async (orderItem) => {
//                         console.log('Processing order item:', orderItem._id);
        
//                         if (orderItem && orderItem.auctionProduct) {
//                             const auctionProduct = await AuctionProduct.findById(orderItem.auctionProduct);
//                             console.log('Auction Product:', auctionProduct);
        
//                             if (auctionProduct) {
//                                 // After
//                                 console.log("Order ----  > " , order);
//                                 if (
//                                     auctionProduct &&
//                                     auctionProduct.winningUser &&
//                                     auctionProduct.winningUser instanceof mongoose.Types.ObjectId &&  // Check if it's an ObjectId
//                                     auctionProduct.winningUser.toString &&
//                                     order &&
//                                     order.user &&
//                                     order.user instanceof mongoose.Types.ObjectId &&  // Check if it's an ObjectId
//                                     order.user.toString &&
//                                     auctionProduct.winningUser.toString() === order.user.toString()
//                                 ) {
//                                     auctionProduct.winningUser = null;
//                                 }                                                                  
//                                 if (!auctionProduct.bannedUsers.includes(order.user.toString())) {
//                                     auctionProduct.bannedUsers.push(order.user);
//                                     bannedAuctionProducts.push(auctionProduct);
//                                 }
        
//                                 await auctionProduct.save();
//                             }
//                         }
//                     }));

//                     // Delete orderItems associated with the order
//                     await OrderItem.deleteMany({ _id: { $in: orderItemsArray.map(item => item._id) } });

//                     const deletedOrder = await Order.findByIdAndDelete(order._id);
//                     console.log('DeletedOrder:', deletedOrder);
        
//                     console.log(`User ${order.user} banned from auction products: ${bannedAuctionProducts.map(product => product._id)}`);
//                 }
//             }
//         }));

//         console.log('Cron job completed.');
//     } catch (error) {
//         console.error('Error in cron job:', error);
//     }
// }, { timezone: 'Africa/Cairo' });


        
// Schedule a job to check for ended auctions and process them every minute
cron.schedule('* * * * *', async () => {
    const now = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    moment.tz.setDefault('Africa/Cairo');
    console.log('Checking for ended auctions at:', now);

    try {
        const endedAuctions = await AuctionProduct.find({
            competitionEnd: { $lt: now },
            isPublished: true,
            winningUser: { $exists: true },
        });
        console.log("endedAuctions Rec ---> ", endedAuctions);
        for (const auctionProduct of endedAuctions) {
            if (auctionProduct.currentPrice > auctionProduct.startingPrice) {
                console.log("auctionProduct ---->>> ", auctionProduct);
                console.log("auctionProduct Id ---->>> ", auctionProduct._id);
                console.log("user ---->>> ", auctionProduct.winningUser);
                console.log("totalPrice ---->>> ", auctionProduct.currentPrice);

                // Create OrderItem
                const orderItemData = {
                    auctionProduct: auctionProduct._id,
                    quantity: 1,
                };

                const newOrderItem = new OrderItem(orderItemData);
                await newOrderItem.save();

                // Retrieve winning user details
                const winningUser = await User.findById(auctionProduct.winningUser);

                const orderData = {
                    orderItems: [newOrderItem._id],
                    shippingAddress1: winningUser.shippingAddress1,
                    city: winningUser.city,
                    zip: winningUser.zip,
                    country: winningUser.country,
                    phone: winningUser.phone,
                    totalPrice: auctionProduct.currentPrice,
                    status: 'Pending',
                    dateOrdered: moment().toDate(),
                    user: winningUser._id,
                };

                const newOrder = new Order(orderData);
                await newOrder.save();

                auctionProduct.isPublished = false;
                await auctionProduct.save();
                console.log('Processed ended auction with ID:', auctionProduct._id);
            } else {
                auctionProduct.isPublished = false;
                await auctionProduct.save();
            }
        }
    } catch (error) {
        console.error('Error processing ended auctions:', error);
    }
});

// Route to create a new auction product
router.post('/auctionProducts', async (req, res) => {
    try {
        // Extract data from the request body
        const reqData = req.body;

        // Format the competitionEnd date if provided
        if (reqData.competitionEnd) {
            reqData.competitionEnd = moment(reqData.competitionEnd).toDate();
        }

        // Define the fields in the schema
        const schemaFields = [
            'name',
            'image',
            'images',
            'startingPrice',
            'currentPrice',
            'isPublished',
            'competitionEnd',
            'bannedUsers',
            'category',
            'status',
            // ... other fields ...
        ];

        // Build the auction product data object with only the provided fields
        const auctionProductData = {};
        for (const field of schemaFields) {
            if (reqData.hasOwnProperty(field)) {
                auctionProductData[field] = reqData[field];
            }
        }

        // Create a new AuctionProduct instance
        const newAuctionProduct = new AuctionProduct(auctionProductData);

        // Save the new auction product to the database
        const savedProduct = await newAuctionProduct.save();

        res.status(201).json(savedProduct); // Respond with the saved product details
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/auctionProducts/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Retrieve the auction product
        const auctionProduct = await AuctionProduct.findById(productId).populate('category'); // Populate the category field

        if (!auctionProduct) {
            return res.status(404).json({ error: 'Auction product not found' });
        }

        // Check if the auction product is published
        if (!auctionProduct.isPublished) {
            return res.status(400).json({ error: 'Auction product is not published' });
        }

        // Check if the auction competition has ended
        const now = moment().toDate();
        if (auctionProduct.competitionEnd < now) {
            return res.status(400).json({ error: 'Auction competition has ended' });
        }

        // Respond with auction product details
        res.status(200).json({
            _id: auctionProduct._id,
            name: auctionProduct.name,
            startingPrice: auctionProduct.startingPrice,
            currentPrice: auctionProduct.currentPrice,
            image: auctionProduct.image,
            images: auctionProduct.images,
            category: auctionProduct.category, // Assuming the category field is populated
            status: auctionProduct.status,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/auctionProducts/:productId/bid/:userId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.params.userId;

        // Retrieve the auction product
        const auctionProduct = await AuctionProduct.findById(productId);

        if (!auctionProduct) {
            return res.status(404).json({ error: 'Auction product not found' });
        }

        // Check if the user is banned for this auction product
        if (auctionProduct.bannedUsers.includes(userId)) {
            return res.status(400).json({ error: 'User is banned from bidding on this auction product' });
        }

        // Check if the auction product is published
        if (!auctionProduct.isPublished) {
            return res.status(400).json({ error: 'Auction product is not published' });
        }

        // Check if the auction competition has ended
        const now = moment();
        if (auctionProduct.competitionEnd < now) {
            return res.status(400).json({ error: 'Auction competition has ended' });
        }

        // Check if the user already won the auction
        if (auctionProduct.winningUser && auctionProduct.winningUser.equals(userId)) {
            return res.status(400).json({ error: 'User already won the auction' });
        }

        // Check if the bid amount is higher than the current price
        const bidAmount = req.body.bidAmount; // Assuming bidAmount is sent in the request body
        if (bidAmount <= auctionProduct.currentPrice) {
            return res.status(400).json({ error: 'Bid amount must be higher than the current price' });
        }

        // Check if the status is Active before updating the current price
        if (auctionProduct.status !== 'Active') {
            return res.status(400).json({ error: 'Auction is not active for bidding' });
        }

        // Update the current price and winning user of the auction product
        auctionProduct.currentPrice = bidAmount;
        auctionProduct.winningUser = userId;

        // Save the updated auction product
        await auctionProduct.save();

        // Respond with success message
        res.status(200).json({ success: true, message: 'Bid placed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/auctionProducts/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Retrieve the auction product
        const auctionProduct = await AuctionProduct.findById(productId);

        if (!auctionProduct) {
            return res.status(404).json({ error: 'Auction product not found' });
        }

        // Delete all orders associated with the auction product
        await Order.deleteMany({ 'orderItems.product': auctionProduct._id });

        // Delete the auction product
        await AuctionProduct.findByIdAndDelete(productId);

        res.status(200).json({ success: true, message: 'Auction product and associated orders deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to update an existing auction product
router.patch('/auctionProducts/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Retrieve the auction product
        const auctionProduct = await AuctionProduct.findById(productId);

        if (!auctionProduct) {
            return res.status(404).json({ error: 'Auction product not found' });
        }

        // Check if the auction has already started
        const currentDate = moment().toDate();
        if (auctionProduct.competitionEnd <= currentDate) {
            return res.status(400).json({ error: 'Auction has already started, cannot update' });
        }

        // Check if the request body contains valid fields (e.g., price or dates)
        const { startingPrice, competitionEnd } = req.body;

        if (startingPrice !== undefined) {
            auctionProduct.startingPrice = startingPrice;
        }

        if (competitionEnd !== undefined) {
            auctionProduct.competitionEnd = moment(competitionEnd).toDate();
        }

        // Save the updated auction product
        await auctionProduct.save();

        res.status(200).json({ success: true, message: 'Auction product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Define a route to get all published auction products
router.get('/api/auctionProducts', async (req, res) => {
    console.log("ssss");
    try {
      // Retrieve all auction products with isPublished set to true
      const auctionProducts = await AuctionProduct.find({isPublished : true});
  
      // Send the list of auction products in the response
      res.json(auctionProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  
// Define a route to get all published auction products
router.get('/admin/auctionProducts', async (req, res) => {
    console.log("ssss");
    try {
      // Retrieve all auction products with isPublished set to true
      const auctionProducts = await AuctionProduct.find();
  
      // Send the list of auction products in the response
      res.json(auctionProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



module.exports = router;
