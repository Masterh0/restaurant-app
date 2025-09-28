import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: null,
        user: null,
        role: null,
    });
    const [loading, setLoading] = useState(true); // برای جلوگیری از پرش به لاگین

    // بازیابی اطلاعات از localStorage هنگام بارگذاری اولیه
    useEffect(() => {
        try {
            const storedAuth = localStorage.getItem('auth');
            console.log("storedAuth:", storedAuth);

            if (storedAuth) {
                const parsed = JSON.parse(storedAuth);
                setAuth(parsed);
                console.log("parsedAuth:", parsed);
            }
        } catch (e) {
            console.error("Failed to parse auth:", e);
            localStorage.removeItem('auth');
        } finally {
            setLoading(false);
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

            setAuth(authData);
            localStorage.setItem('auth', JSON.stringify(authData));

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
        localStorage.removeItem('auth');
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
