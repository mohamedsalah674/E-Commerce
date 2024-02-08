// ProductManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    richDescription: '',
    image: '',
    brand: '',
    price: 0,
    category: '',
    countInStock: 0,
    rating: 0,
    numReviews: 0,
    isFeatured: false,
  });

  useEffect(() => {
    // Fetch all categories from the server
    axios.get('http://localhost:4001/api/category')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));

    // Fetch all products from the server
    axios.get('http://localhost:4001/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to create a new product
      const response = await axios.post('http://localhost:4001/products', newProduct);

      // Update the list of products with the newly added one
      setProducts([...products, response.data]);

      // Clear the form data for the next entry
      setNewProduct({
        name: '',
        description: '',
        richDescription: '',
        image: '',
        brand: '',
        price: 0,
        category: '',
        countInStock: 0,
        rating: 0,
        numReviews: 0,
        isFeatured: false,
      });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div>
      <h2>Product Management</h2>

      {/* Form to add a new product */}
      <form onSubmit={handleSubmit}>
        <label>Name: <input type="text" name="name" value={newProduct.name} onChange={handleChange} required /></label>
        <label>Description: <input type="text" name="description" value={newProduct.description} onChange={handleChange} /></label>
        <label>Rich Description: <input type="text" name="richDescription" value={newProduct.richDescription} onChange={handleChange} /></label>
        <label>Image URL: <input type="text" name="image" value={newProduct.image} onChange={handleChange} /></label>
        <label>Brand: <input type="text" name="brand" value={newProduct.brand} onChange={handleChange} /></label>
        <label>Price: <input type="number" name="price" value={newProduct.price} onChange={handleChange} required /></label>
        <label>Category:
          <select name="category" value={newProduct.category} onChange={handleChange} required>
            <option value="" disabled>Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>Count In Stock: <input type="number" name="countInStock" value={newProduct.countInStock} onChange={handleChange} required /></label>
        <label>Rating: <input type="number" name="rating" value={newProduct.rating} onChange={handleChange} /></label>
        <label>Num Reviews: <input type="number" name="numReviews" value={newProduct.numReviews} onChange={handleChange} /></label>
        <label>Featured: <input type="checkbox" name="isFeatured" checked={newProduct.isFeatured} onChange={() => setNewProduct({ ...newProduct, isFeatured: !newProduct.isFeatured })} /></label>
        <button type="submit">Add Product</button>
      </form>

      {/* Display existing products */}
      <h2>All Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => (
          <div key={product._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{product.name}</h3>
            <p>Description: {product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category.name}</p>
            {/* Add more details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
