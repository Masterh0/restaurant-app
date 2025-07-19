import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
        role: null,
    });

    // بازیابی اطلاعات از localStorage هنگام بارگذاری اولیه
    useEffect(() => {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            setAuth(JSON.parse(storedAuth));
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token-auth/', {
                username,
                password,
            });

            const authData = {
                token: response.data.token,
                user: response.data.username,
                role: response.data.role,
            };

            setAuth(authData); // به‌روزرسانی state
            localStorage.setItem('auth', JSON.stringify(authData)); // ذخیره در localStorage

            return response.data;
        } catch (err) {
            console.error('Login failed:', err);
            throw err;
        }
    };

    const logout = () => {
        setAuth({
            token: null,
            user: null,
            role: null,
        });
        localStorage.removeItem('auth'); // حذف اطلاعات از localStorage
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
