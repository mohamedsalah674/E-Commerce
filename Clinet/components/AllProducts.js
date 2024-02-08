import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useRouter } from 'next/router';

const AllProducts = () => {
  const router = useRouter();

  const [groupedProducts, setGroupedProducts] = useState({});
  const [quantities, setQuantities] = useState({});
  const [shippingDetails, setShippingDetails] = useState({
    // ... existing shippingDetails properties
  });
  const [editableShippingDetails, setEditableShippingDetails] = useState({
    // ... existing editableShippingDetails properties
  });
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [userData, setUserData] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data from your API
        const userResponse = await axios.get(`http://localhost:4001/getUser/${router.query.id}`);
        const userDataFromApi = userResponse.data;
        setUserData(userDataFromApi);

        // Fetch all categories
        const categoriesResponse = await axios.get(`http://localhost:4001/api/category`);
        const groupedProductsData = {};

        // Fetch products for each category
        await Promise.all(categoriesResponse.data.map(async (category) => {
          const productsResponse = await axios.get(`http://localhost:4001/catProducts/${category._id}`);
          const initialQuantities = {};

          productsResponse.data.forEach(product => {
            initialQuantities[product._id] = 1;
          });

          setQuantities(prevQuantities => ({
            ...prevQuantities,
            ...initialQuantities,
          }));

          groupedProductsData[category.name] = productsResponse.data;
        }));

        setGroupedProducts(groupedProductsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error fetching data. Please try again.', { position: 'top-right' });
      }
    };

    fetchData();
  }, [router.query.id]);

  const handleQuantityChange = (productId, event) => {
    const newQuantity = parseInt(event.target.value, 10);
    setQuantities({ ...quantities, [productId]: newQuantity });
  };

  const handleAddToCart = async (productId) => {
    try {
      const userId = '65bec97860a51dbc37f5d8f5';
      const quantity = quantities[productId];

      await axios.post(`http://localhost:4001/carts/${userId}/add-product`, {
        orderItems: [{ product: productId, quantity }],
      });

      toast.success('Product added to cart successfully', { position: 'top-right' });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      toast.error(error.response.data.error, { position: 'top-right' });
    }
  };

  const handleBuyNow = (productId) => {
    if (userData) {
      // Use userData to auto-fill shipping details
      setShippingDetails({
        shippingAddress1: userData.shippingAddress1 || '',
        shippingAddress2: userData.shippingAddress2 || '',
        city: userData.city || '',
        zip: userData.zip || '',
        country: userData.country || '',
        phone: userData.phone || '',
      });
  
      // Retrieve the category based on the selected productId
      const selectedCategory = Object.keys(groupedProducts).find(category =>
        groupedProducts[category].some(product => product._id === productId)
      );
  
      // Set selected product category
      setSelectedProductCategory(selectedCategory);
  
      // Set confirmation dialog open and store the selected product ID
      setConfirmationDialogOpen(true);
      setSelectedProductId(productId);
    } else {
      toast.error('Error fetching user data. Please try again.', { position: 'top-right' });
    }
  };
  
  const handleConfirmOrder = async () => {
    try {
      const userId = '65bec97860a51dbc37f5d8f5';
      const user = userId;
  
      // Validate required fields
      if (!editableShippingDetails.shippingAddress1 || !editableShippingDetails.city || !editableShippingDetails.zip) {
        toast.error('Please fill in all required fields.', { position: 'top-right' });
        return;
      }
  
      const selectedProductCategory = groupedProducts[selectedProductId];
  
      console.log('Selected Product Category:', selectedProductCategory); // Add this line for debugging
  
      if (selectedProductCategory && Array.isArray(selectedProductCategory)) {
        const selectedProduct = selectedProductCategory.find(product => product._id === selectedProductId);
  
        console.log('Selected Product:', selectedProduct); // Add this line for debugging
  
        if (selectedProduct) {
          // Proceed with your logic using selectedProduct
          const orderItems = [{
            product: selectedProduct._id,
            quantity: quantities[selectedProductId],
          }];
  
          const orderData = {
            user,
            orderItems,
            ...editableShippingDetails,
          };
  
          console.log('Order Data:', orderData); // Add this line for debugging
  
          const response = await axios.post('http://localhost:4001/orders/', orderData);
          const { orderId } = response.data;
          setOrderId(orderId);
  
          setConfirmationDialogOpen(false);
  
          toast.success('Order placed successfully', { position: 'top-right' });
        } else {
          toast.error('Selected product not found.', { position: 'top-right' });
        }
      } else {
        toast.error('Invalid category or products not found.', { position: 'top-right' });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response); // Add this line for debugging
      toast.error(error.response?.data?.error || 'An error occurred', { position: 'top-right' });
    }
  };
  
  return (
    <div>
      {Object.keys(groupedProducts).map((category) => (
        <div key={category}>
          <Typography variant="h4" style={{ marginTop: '20px', marginBottom: '10px' }}>{category}</Typography>
          {groupedProducts[category].map((product) => (
            <Card key={product._id} style={{ marginBottom: '20px' }}>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="subtitle1">Price: ${product.price}</Typography>
                <Typography variant="body2">{product.description}</Typography>
                <Typography variant="body2">Brand: {product.brand}</Typography>
                <Typography variant="body2">Category: {product.category.name}</Typography>
                <Typography variant="body2" className='cc' mb={3}>Stock: {product.countInStock}</Typography>

                <TextField
                  label="Quantity"
                  type="number"
                  value={quantities[product._id]}
                  onChange={(event) => handleQuantityChange(product._id, event)}
                  inputProps={{ min: 1 }}
                  style={{ marginBottom: '10px' }}
                />

                <Button
                  onClick={() => handleAddToCart(product._id)}
                  style={{ marginRight: '10px' }}
                >
                  Add to Cart
                </Button>

                <Button
                  onClick={() => handleBuyNow(product._id)}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)}>
        <DialogTitle>Order Confirmation</DialogTitle>
          <DialogContent>
    <TextField
      label="Address 1"
      multiline
      rows={2}
      required
      value={editableShippingDetails.shippingAddress1}
      fullWidth
      margin="normal"
      InputProps={{
        readOnly: false,
      }}
      onChange={(event) => setEditableShippingDetails({
        ...editableShippingDetails,
        shippingAddress1: event.target.value,
      })}
    />

    <TextField
      label="Address 2"
      multiline
      rows={2}
      required
      value={editableShippingDetails.shippingAddress2}
      fullWidth
      margin="normal"
      InputProps={{
        readOnly: false,
      }}
      onChange={(event) => setEditableShippingDetails({
        ...editableShippingDetails,
        shippingAddress2: event.target.value,
      })}
    />

    <TextField
      label="City"
      required
      value={editableShippingDetails.city}
      fullWidth
      margin="normal"
      InputProps={{
        readOnly: false,
      }}
      onChange={(event) => setEditableShippingDetails({
        ...editableShippingDetails,
        city: event.target.value,
      })}
    />

    <TextField
      label="ZIP Code"
      required
      value={editableShippingDetails.zip}
      fullWidth
      margin="normal"
      InputProps={{
        readOnly: false,
      }}
      onChange={(event) => setEditableShippingDetails({
        ...editableShippingDetails,
        zip: event.target.value,
      })}
    />

    <TextField
      label="Country"
      required
      value={editableShippingDetails.country}
      fullWidth
      margin="normal"
      InputProps={{
        readOnly: false,
      }}
      onChange={(event) => setEditableShippingDetails({
        ...editableShippingDetails,
        country: event.target.value,
      })}
    />

    <TextField
      label="Phone"
      required
      value={editableShippingDetails.phone}
      fullWidth
      margin="normal"
      InputProps={{
        readOnly: false,
      }}
      onChange={(event) => setEditableShippingDetails({
        ...editableShippingDetails,
        phone: event.target.value,
      })}
    />
  </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)} color="primary">
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

export default AllProducts;
