// Example components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [removeConfirmationDialogOpen, setRemoveConfirmationDialogOpen] = useState(false);
  const [orderConfirmationDialogOpen, setOrderConfirmationDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editableShippingDetails, setEditableShippingDetails] = useState({
    shippingAddress1: '',
    shippingAddress2: '',
    city: '',
    zip: '',
    country: '',
    phone: '',
    otherDetails: '',
    quantity: 0,
  });

  useEffect(() => {
    const userId = '65bec97860a51dbc37f5d8f5';

    axios.get(`http://localhost:4001/carts/${router.query.id}`)
      .then(response => {
        if (response.data && Array.isArray(response.data.orderItems)) {
          setCart(response.data.orderItems);
        } else {
          console.error('Invalid cart data structure:', response.data);
          setCart([]);
        }
      })
      .catch(error => {
        console.error('Error fetching cart data:', error);
        setCart([]);
      });
  }, [router.query.id]);

  const handleMakeOrder = () => {
    setEditableShippingDetails({
      shippingAddress1: '',
      shippingAddress2: '',
      city: '',
      zip: '',
      country: '',
      phone: '',
      otherDetails: '',
      quantity: 0,
    });

    setOrderConfirmationDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    try {
      const userId = '65bec97860a51dbc37f5d8f5';

      if (!editableShippingDetails.shippingAddress1 || !editableShippingDetails.city || !editableShippingDetails.zip) {
        toast.error('Please fill in all required fields.', { position: 'top-right' });
        return;
      }

      if (cart.length === 0) {
        toast.error('Your cart is empty.', { position: 'top-right' });
        return;
      }

      const orderItems = cart.map(cartItem => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
      }));

      const orderData = {
        user: userId,
        orderItems,
        shippingAddress1: editableShippingDetails.shippingAddress1,
        shippingAddress2: editableShippingDetails.shippingAddress2,
        city: editableShippingDetails.city,
        zip: editableShippingDetails.zip,
        country: editableShippingDetails.country,
        phone: editableShippingDetails.phone,
        otherDetails: editableShippingDetails.otherDetails,
        quantity: editableShippingDetails.quantity,
      };

      const response = await axios.post(`http://localhost:4001/carts/${router.query.id}/place-order`, orderData);

      console.log('Order Data:', orderData);
      console.log('Order confirmed successfully');
      toast.success('Order confirmed successfully', { position: 'top-right' });

      setOrderConfirmationDialogOpen(false);
      setCart([]); // Clear the cart after placing the order

    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error.response?.data?.error || 'Internal Server Error', { position: 'top-right' });
    }
  };

  const handleInputChange = (field, value) => {
    setEditableShippingDetails({
      ...editableShippingDetails,
      [field]: value,
    });
  };

  const handleOpenRemoveConfirmationDialog = (productId) => {
    setSelectedProductId(productId);
    setRemoveConfirmationDialogOpen(true);
  };

  const handleCloseRemoveConfirmationDialog = () => {
    setSelectedProductId(null);
    setRemoveConfirmationDialogOpen(false);
  };
  const handleRemoveFromCart = async (orderItem) => {
    try {
      console.log(`http://localhost:4001/carts/${router.query.id}/remove-from-cart/${orderItem._id}`);
      const response = await axios.delete(`http://localhost:4001/carts/${router.query.id}/remove-from-cart/${orderItem._id}`);
      setCart(response.data.cart);
      toast.success('Item removed from cart', { position: 'top-right' });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error(error.response?.data?.error || 'Internal Server Error', { position: 'top-right' });
    }
  };

  return (
    <div>
      <h1>Your Dashboard</h1>

      <h2>Your Cart</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Array.isArray(cart) && cart.map(cartItem => (
          <div key={cartItem.product._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "1rem",
              }}
            >
              <h3>{cartItem.product.name}</h3>
              <p>Description: {cartItem.product.description}</p>
              <p>Price: ${cartItem.product.price}</p>
              <p>Count in Stock: {cartItem.product.countInStock}</p>
              <p>Quantity: {cartItem.quantity}</p>
              <Button onClick={() => handleOpenRemoveConfirmationDialog(cartItem)}>Remove Item</Button>
            </Box>
          </div>
        ))}
      </div>

      <Dialog open={removeConfirmationDialogOpen} onClose={handleCloseRemoveConfirmationDialog}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to remove this item from your cart?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveConfirmationDialog}>Cancel</Button>
          <Button onClick={() => handleRemoveFromCart(selectedProductId)} variant="contained" color="error">
            Remove Item
          </Button>
        </DialogActions>
      </Dialog>

      <Button onClick={handleMakeOrder} variant="contained" color="primary">
        Place Order
      </Button>

      <Dialog open={orderConfirmationDialogOpen} onClose={() => setOrderConfirmationDialogOpen(false)}>
        <DialogTitle>Order Confirmation</DialogTitle>
        <DialogContent>
          <TextField
            label="Shipping Address 1"
            multiline
            rows={2}
            required
            value={editableShippingDetails.shippingAddress1}
            fullWidth
            margin="normal"
            onChange={(e) => handleInputChange('shippingAddress1', e.target.value)}
          />
          <TextField
            label="Shipping Address 2"
            multiline
            rows={2}
            value={editableShippingDetails.shippingAddress2}
            fullWidth
            margin="normal"
            onChange={(e) => handleInputChange('shippingAddress2', e.target.value)}
          />
          <TextField
            label="City"
            required
            value={editableShippingDetails.city}
            fullWidth
            margin="normal"
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
          <TextField
            label="Zip"
            required
            value={editableShippingDetails.zip}
            fullWidth
            margin="normal"
            onChange={(e) => handleInputChange('zip', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderConfirmationDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmOrder} color="primary">
            Confirm Order
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
