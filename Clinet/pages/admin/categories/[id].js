// CategoryManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    color: '',
  });

  useEffect(() => {
    // Fetch all categories from the server
    axios.get('http://localhost:4001/api/category')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to create a new category
      const response = await axios.post('http://localhost:4001/api/category', newCategory);

      // Update the list of categories with the newly added one
      setCategories([...categories, response.data]);

      // Clear the form data for the next entry
      setNewCategory({
        name: '',
        icon: '',
        color: '',
      });
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div>
      <h2>Category Management</h2>

      {/* Form to add a new category */}
      <form onSubmit={handleSubmit}>
        <label>Name: <input type="text" name="name" value={newCategory.name} onChange={handleChange} required /></label>
        <label>Icon: <input type="text" name="icon" value={newCategory.icon} onChange={handleChange} /></label>
        <label>Color: <input type="text" name="color" value={newCategory.color} onChange={handleChange} /></label>
        <button type="submit">Add Category</button>
      </form>

      {/* Display existing categories */}
      <h2>All Categories</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {categories.map(category => (
          <div key={category._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{category.name}</h3>
            <p>Icon: {category.icon}</p>
            <p>Color: {category.color}</p>
            {/* Add more details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
