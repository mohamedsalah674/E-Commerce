// AuctionProductManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuctionProductManagement = () => {
  const [auctionProducts, setAuctionProducts] = useState([]);
  const [newAuctionProduct, setNewAuctionProduct] = useState({
    name: '',
    startingPrice: 0,
    currentPrice: 0,
    isPublished: false,
    competitionEnd: '',
    bannedUsers: [],
    category: '',
    status: 'Active', // You can set a default status if needed
    // ... other fields ...
  });

  const [isFormVisible, setFormVisibility] = useState(false);

  useEffect(() => {
    // Fetch all auction products from the server
    axios.get('http://localhost:4001/admin/auctionProducts')
      .then(response => setAuctionProducts(response.data))
      .catch(error => console.error('Error fetching auction products:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAuctionProduct({ ...newAuctionProduct, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to create a new auction product
      const response = await axios.post('http://localhost:4001/auctionProducts', newAuctionProduct);

      // Update the list of auction products with the newly added one
      setAuctionProducts([...auctionProducts, response.data]);

      // Clear the form data for the next entry
      setNewAuctionProduct({
        name: '',
        startingPrice: 0,
        currentPrice: 0,
        isPublished: false,
        competitionEnd: '',
        bannedUsers: [],
        category: '',
        status: 'Active', // You can set a default status if needed
        // ... other fields ...
      });

      // Hide the form after submitting
      setFormVisibility(false);
    } catch (error) {
      console.error('Error creating auction product:', error);
    }
  };

  return (
    <div>
      <h2>Auction Product Management</h2>

      {/* Button to toggle the form visibility */}
      <button onClick={() => setFormVisibility(!isFormVisible)}>
        {isFormVisible ? 'Hide Form' : 'Add Auction Product'}
      </button>

      {/* Form to add a new auction product (conditionally rendered) */}
      {isFormVisible && (
        <form onSubmit={handleSubmit}>
          <label>Name: <input type="text" name="name" value={newAuctionProduct.name} onChange={handleChange} required /></label>
          <label>Starting Price: <input type="number" name="startingPrice" value={newAuctionProduct.startingPrice} onChange={handleChange} required /></label>
          <label>Current Price: <input type="number" name="currentPrice" value={newAuctionProduct.currentPrice} onChange={handleChange} required /></label>
          <label>Published: <input type="checkbox" name="isPublished" checked={newAuctionProduct.isPublished} onChange={() => setNewAuctionProduct({ ...newAuctionProduct, isPublished: !newAuctionProduct.isPublished })} /></label>
          <label>Competition End: <input type="datetime-local" name="competitionEnd" value={newAuctionProduct.competitionEnd} onChange={handleChange} required /></label>
          <label>Category: <input type="text" name="category" value={newAuctionProduct.category} onChange={handleChange} required /></label>
          {/* Add more input fields based on your requirements */}
          <button type="submit">Add Auction Product</button>
        </form>
      )}

      {/* Display existing auction products */}
      <h2>All Auction Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {auctionProducts.map(auctionProduct => (
          <div key={auctionProduct._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{auctionProduct.name}</h3>
            <p>Starting Price: ${auctionProduct.startingPrice}</p>
            <p>Current Price: ${auctionProduct.currentPrice}</p>
            <p>Published: {auctionProduct.isPublished ? 'Yes' : 'No'}</p>
            <p>Competition End: {new Date(auctionProduct.competitionEnd).toLocaleString()}</p>
            <p>Category: {auctionProduct.category}</p>
            <p>Status: {auctionProduct.status}</p>
            {/* Add more details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionProductManagement;
