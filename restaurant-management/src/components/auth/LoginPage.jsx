import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const { login } = useAuth(); // استفاده از هوک برای لاگین
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);

            // ذخیره توکن و اطلاعات کاربر در localStorage
            const authData = {
                token: response.token,
                user: response.username,
                role: response.role,
            };
            localStorage.setItem('auth', JSON.stringify(authData));

            // Redirect based on role
            if (response.role === 'manager') {
                navigate('/manager');
            } else if (response.role === 'employee') {
                navigate('/employee');
            } else if (response.role === 'customer') {
                navigate('/customer');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="input-field">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label>Enter your email</label>
                </div>
                <div className="input-field">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label>Enter your password</label>
                </div>
                <button type="submit">Log In</button>
                <div className="register">
                    <p>Don't have an account? <a href="/signup">Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
