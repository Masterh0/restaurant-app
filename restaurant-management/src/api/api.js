// src/api/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; 

// GET request to fetch data from server
export const getDishes = async () => {
    const response = await fetch(`${API_BASE_URL}/dishes/`);
    if (!response.ok) {
        throw new Error('Failed to fetch dishes');
    }
    const data = await response.json();
    return data;
};

export const createDish = async (dish) => {
    const response = await fetch(`${API_BASE_URL}/dishes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dish),
    });
    if (!response.ok) {
        throw new Error('Failed to create dish');
    }
    const data = await response.json();
    return data;
};

export const updateDish = async (id, dish) => {
    const response = await fetch(`${API_BASE_URL}/dishes/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dish),
    });
    if (!response.ok) {
        throw new Error('Failed to update dish');
    }
    const data = await response.json();
    return data;
};

export const deleteDish = async (id) => {
    const response = await fetch(`${API_BASE_URL}/dishes/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete dish');
    }
    const data = await response.json();
    return data;
};

const api = axios.create({
    baseURL: '/api/',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  
  export default api;
