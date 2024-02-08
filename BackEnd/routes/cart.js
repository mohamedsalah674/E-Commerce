// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const {Product} = require('../models/product');
const { OrderItem } = require('../models/order-item');
const {Order} = require('../models/order');
const User = require('../models/users');

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cart = await Cart.findOne({ user: userId }).populate('orderItems.product');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/carts/:userid/add-product', async (req, res) => {
  try {
      const userId = req.params.userid;

      // Validate user and shipping details
      if (!userId) {
          return res.status(400).json({ error: 'Invalid user ID' });
      }

      let invalidQuantityProduct = null;

      // Check if any product has an invalid quantity
      for (const orderItem of req.body.orderItems) {
          const productToBeBoughtId = orderItem.product;
          const productToBeBought = await Product.findById(productToBeBoughtId);

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
          return res.status(400).json({ error: 'Invalid quantity for product' });
      }

      // Create new order items
      const orderItems = await Promise.all(req.body.orderItems.map(async (orderItem) => {
          const newOrderItem = new OrderItem({
              quantity: orderItem.quantity,
              product: orderItem.product,
          });

          // Save the newOrderItem to the database
          return await newOrderItem.save();
      }));

      // Calculate Actual price
      const totalPrices = await Promise.all(orderItems.map(async (orderItem) => {
        const productToBeBought = await Product.findById(orderItem.product);
    
        if (!productToBeBought) {
            console.error(`Product with ID ${orderItem.product} not found.`);
            return 0; // Assume a price of 0 for non-existent products
        }
    
        const productPrice = productToBeBought.price;
        const quantity = orderItem.quantity;
    
        if (isNaN(productPrice) || isNaN(quantity)) {
            console.error(`Invalid price or quantity for product with ID ${orderItem.product}`);
            return 0; // Assume a price of 0 for invalid prices or quantities
        }
    
        return productPrice * quantity;
      }));

      // Calculate total price
      const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

      // Find the user's cart or create a new one if not exists
      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
          cart = new Cart({
              user: userId,
              orderItems: [],
              totalPrice: 0,
          });
      }

      // Add the new order items to the cart
      cart.orderItems.push(...orderItems);

      // Check if totalPrice is a valid number
      if (!isNaN(totalPrice) && typeof totalPrice === 'number') {
          // Update the total price in the cart
          cart.totalPrice += totalPrice;
      } else {
          // Handle the case where totalPrice is NaN or not a number
          console.error('Invalid totalPrice:', totalPrice);
          res.status(400).json({ error: 'Invalid totalPrice value' });
          return; // Stop execution
      }

      // Save the cart
      await cart.save();

      console.log('Cart:', cart);
      

      res.status(200).send('Product added successfully');
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


  router.get('/carts/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const cart = await Cart.findOne({ user: userId })
      .populate({
          path: 'orderItems',
          populate: {
              path: 'product',
              model: 'Product'
          }
      });  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      console.log(cart);
      res.json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  router.post('/carts/:userid/place-order', async (req, res) => {
    try {
        const userId = req.params.userid;

        // Validate user ID
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await User.findById(userId);
        // Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('orderItems');

        if (!cart || cart.orderItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create a new order
        const newOrder = new Order({
            user: userId,
            orderItems: cart.orderItems,
            totalPrice: cart.totalPrice,
            shippingAddress1 : req.body.shippingAddress1,
            status: "Pending",
            country : user.country,
            zip: user.zip,
            phone : user.phone,
            city : user.city

        });

        // Save the order to the database
        await newOrder.save();

        // Clear the user's cart after placing the order
        await Cart.findOneAndUpdate({ user: userId }, { $set: { orderItems: [], totalPrice: 0 } });

        res.status(200).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.patch('/:userid/update-cart/:orderitemid', async (req, res) => {
  try {
      const userId = req.params.userid;
      const orderItemId = req.params.orderitemid;

      // Validate user ID and order item ID
      if (!userId || !orderItemId) {
          return res.status(400).json({ error: 'Invalid user ID or order item ID' });
      }

      // Find the user's cart
      const cart = await Cart.findOne({ user: userId }).populate('orderItems');

      if (!cart) {
          return res.status(404).json({ error: 'Cart not found' });
      }

      // Check if the order item exists in the cart
      const orderItem = cart.orderItems.find(item => item._id.equals(orderItemId));

      if (!orderItem) {
          return res.status(404).json({ error: 'Order item not found in the cart' });
      }

      // Update order item data
      if (req.body.quantity) {
          orderItem.quantity = req.body.quantity;
      }

      // Recalculate the total price
      cart.totalPrice = cart.orderItems.reduce((total, item) => {
          return total + item.product.price * item.quantity;
      }, 0);

      // Save the updated cart
      await cart.save();

      res.status(200).json({ message: 'Order item updated in the cart', cart });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/carts/:userid/remove-from-cart/:orderitemid', async (req, res) => {
    try {
      const userId = req.params.userid;
      const orderItemId = req.params.orderitemid;
  
      // Validate user ID and order item ID
      if (!userId || !orderItemId) {
        return res.status(400).json({ error: 'Invalid user ID or order item ID' });
      }
  
      // Find the user's cart
      const cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
  
      // Check if the order item exists in the cart
      const orderItemIndex = cart.orderItems.indexOf(orderItemId);
  
      if (orderItemIndex === -1) {
        return res.status(404).json({ error: 'Order item not found in the cart' });
      }
  
  
      const orderItem = await OrderItem.findById(orderItemId)
      if (!orderItem){
        console.log("Erorrrrrrrrrrrrrrrrrrrr");
      }
      console.log("orderItem" , orderItem);
      console.log("ID" ,orderItem._id );

      const orderQuantity = orderItem.quantity
      console.log("orderQuantity" , orderQuantity);

      const productId = orderItem.product
      console.log("productId" , productId);

      const id = productId.toString();
      console.log("New Id " , id);

      const productP = await Product.findById(id)
      console.log("productP" , productP);
      
      const productPrice = productP.price
      console.log("Price  " , productPrice);

      const totalPrice = productPrice * orderQuantity
      console.log("totalPrice" , totalPrice);

      let cartTotalPrice = cart.totalPrice
      console.log("cartTotalPrice" , cartTotalPrice);
      
      const priceTobeUpdated =  cartTotalPrice - totalPrice
      console.log("priceTobeUpdated" , priceTobeUpdated);

     await Cart.findByIdAndUpdate(cart._id ,{
        totalPrice : priceTobeUpdated
      },
      { new: true}
      
      )
      // Remove the order item from the cart
      cart.orderItems.splice(orderItemIndex, 1);
  
      // Save the updated cart
      await cart.save();
  
      res.status(200).json({ message: 'Order item removed from the cart', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



module.exports = router;
