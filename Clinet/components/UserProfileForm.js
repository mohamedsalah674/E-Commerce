import React, { useState, useEffect } from 'react';
import UserProfileForm from '../components/UserProfileForm';
import axios from 'axios';

const UserOrderPage = () => {
  const [userData, setUserData] = useState(null);
  const [orderData, setOrderData] = useState([]);

  // Replace 'userId' with the actual user ID or fetch it from your authentication system
  const userId = '65bec97860a51dbc37f5d8f5';

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:4001/getUser/${userId}`);
      const fetchedUserData = response.data;
      setUserData(fetchedUserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch order data
  const fetchOrderData = async () => {
    try {
      const response = await axios.get(`http://localhost:4001/products`);
      const fetchedOrderData = response.data;
      setOrderData(fetchedOrderData);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  // Fetch user and order data when the page loads
  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);

  // Handle adding a product to the cart
  const handleAddToCart = (productId) => {
    // Implement logic to add the product to the cart
    console.log(`Product ${productId} added to cart`);
  };

  // Handle buying the products in the cart
  const handleBuyNow = () => {
    // Implement logic to proceed with the purchase
    console.log('Buying products');
  };

  return (
    <div>
      <h1>User Order Page</h1>
      {userData && (
        <UserProfileForm
          userData={userData}
          orderData={orderData}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
      {/* Add other components or content */}
    </div>
  );
};

export default UserOrderPage;
