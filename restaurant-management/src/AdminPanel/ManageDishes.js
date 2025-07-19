import React, { useState } from 'react';

function ManageDishes() {
  const [dish, setDish] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setDish({
      ...dish,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', dish.name);
    formData.append('description', dish.description);
    formData.append('category', dish.category);
    formData.append('price', dish.price);
    formData.append('image', dish.image);

    try {
      const response = await fetch('/api/dishes/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Dish added successfully!');
        // You can reset form or refresh data here
      } else {
        alert('Failed to add dish.');
      }
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={dish.name} onChange={handleChange} placeholder="Dish Name" required />
      <input type="text" name="description" value={dish.description} onChange={handleChange} placeholder="Description" required />
      <select name="category" value={dish.category} onChange={handleChange} required>
        <option value="">Select Category</option>
        <option value="Iranian">Iranian</option>
        <option value="FastFood">Fast Food</option>
        <option value="Drink">Drink</option>
        <option value="Dessert">Dessert</option>
        <option value="Appetizer">Appetizer</option>
      </select>
      <input type="number" name="price" value={dish.price} onChange={handleChange} placeholder="Price" required />
      <input type="file" name="image" onChange={handleChange} />
      <button type="submit">Add Dish</button>
    </form>
  );
}

export default ManageDishes;
