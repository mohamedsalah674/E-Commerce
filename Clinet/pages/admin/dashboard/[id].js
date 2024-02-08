// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const AdminDashboard = () => {
  const [auctionProducts, setAuctionProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [newAuctionProduct, setNewAuctionProduct] = useState({
    name: '',
    startingPrice: 0,
    currentPrice: 0,
    paymentDeadline: 24,
    competitionEnd: new Date().toISOString(),
    category: '',
  });

  const [isAddProductDialogOpen, setAddProductDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch auction products from the provided API endpoint
    axios.get('http://localhost:4001/api/auctionProducts')
      .then(response => setAuctionProducts(response.data))
      .catch(error => console.error('Error fetching auction products:', error));

    // Fetch all products (replace 'allProductsEndpoint' with the correct endpoint for your all products)
    axios.get('http://localhost:4001/products')
      .then(response => setAllProducts(response.data))
      .catch(error => console.error('Error fetching all products:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAuctionProduct({ ...newAuctionProduct, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to the server to create a new auction product
      const response = await axios.post('http://localhost:4001/auctionProducts', newAuctionProduct);

      // Optionally, you can handle the response, show a success message, or redirect the user
      console.log('New auction product created:', response.data);

      // Update the list of auction products to include the newly added one
      setAuctionProducts([...auctionProducts, response.data]);

      // Clear the form data for the next entry
      setNewAuctionProduct({
        name: '',
        startingPrice: 0,
        currentPrice: 0,
        paymentDeadline: 24,
        competitionEnd: new Date().toISOString(),
        category: '',
      });

      // Close the dialog after submitting
      setAddProductDialogOpen(false);
    } catch (error) {
      console.error('Error creating auction product:', error);
      // Optionally, you can show an error message to the user
    }
  };

  return (
    <div>
      <h2>Manage Auction Products</h2>

      {/* Button to open the Add Product dialog */}
      <button onClick={() => setAddProductDialogOpen(true)}>Add New Auction Product</button>

      {/* Form Modal */}
      <Modal
        isOpen={isAddProductDialogOpen}
        onRequestClose={() => setAddProductDialogOpen(false)}
      >
        <div>
          <h3>Add New Auction Product</h3>
          <form onSubmit={handleSubmit}>
            <label>Name: <input type="text" name="name" value={newAuctionProduct.name} onChange={handleChange} /></label>
            <label>Starting Price: <input type="number" name="startingPrice" value={newAuctionProduct.startingPrice} onChange={handleChange} /></label>
            <label>Current Price: <input type="number" name="currentPrice" value={newAuctionProduct.currentPrice} onChange={handleChange} /></label>
            <label>Payment Deadline: <input type="number" name="paymentDeadline" value={newAuctionProduct.paymentDeadline} onChange={handleChange} /></label>
            <label>Competition End: <input type="datetime-local" name="competitionEnd" value={newAuctionProduct.competitionEnd} onChange={handleChange} /></label>
            <label>Category: <input type="text" name="category" value={newAuctionProduct.category} onChange={handleChange} /></label>

            {/* Add more input fields based on your requirements */}

            {/* Close button */}
            <button type="button" onClick={() => setAddProductDialogOpen(false)}>Close</button>

            {/* Submit button */}
            <button type="submit">Create Auction Product</button>
          </form>
        </div>
      </Modal>

      {/* Display existing auction products */}
      <h2>All Auction Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {auctionProducts.map(auctionProduct => (
          <div key={auctionProduct._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{auctionProduct.name}</h3>
            <p>Starting Price: ${auctionProduct.startingPrice}</p>
            <p>Current Price: ${auctionProduct.currentPrice}</p>
            <p>Payment Deadline: {auctionProduct.paymentDeadline} hours</p>
            <p>Competition End: {new Date(auctionProduct.competitionEnd).toLocaleString()}</p>
            <p>Category: {auctionProduct.category}</p>
            <p>Status: {auctionProduct.status}</p>
            <p>Winning User: {auctionProduct.winningUser}</p>
            {/* Add more details as needed */}
          </div>
        ))}
      </div>

      {/* Display all products */}
      <h2>All Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {allProducts.map(product => (
          <div key={product._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{product.name}</h3>
            <p>Description: {product.description}</p>
            <p>Brand: {product.brand}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category.name}</p>
            <p>Count In Stock: {product.countInStock}</p>
            <p>Rating: {product.rating}</p>
            <p>Number of Reviews: {product.numReviews}</p>
            <p>Featured: {product.isFeatured ? 'Yes' : 'No'}</p>
            <p>Date Created: {new Date(product.dateCreated).toLocaleString()}</p>
            {/* Add more details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
