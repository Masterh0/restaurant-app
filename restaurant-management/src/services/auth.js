// src/services/auth.js
export const getToken = async (username, password) => {
    const response = await fetch('http://127.0.0.1:8000/api/token-auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      
    });
  
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
  
    const data = await response.json();
    return data.token;
  };
  