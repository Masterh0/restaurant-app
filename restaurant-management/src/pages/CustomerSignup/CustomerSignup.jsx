import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './CustomerSignup.css';

const CustomerSignup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showLoginLink, setShowLoginLink] = useState(false);

    const navigate = useNavigate(); // Hook for navigation

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/customer-registration/",
                {
                    ...formData,
                    role: "customer", // Default role
                }
            );
            setSuccessMessage(response.data.message);
            setErrorMessage(""); // Clear any previous error
            setShowLoginLink(false); // Hide login link if successful

            // Redirect to login or some other page
            navigate("/customer"); // Redirect to home or any other page
        } catch (error) {
            const errorData = error.response?.data;

            // Handle username uniqueness error specifically
            if (errorData && errorData.username?.[0] === "A user with that username already exists.") {
                setErrorMessage("Username is already taken. Please try another.");
                setShowLoginLink(true); // Show login link
            } else {
                setErrorMessage(errorData?.message || "Failed to register. Please try again.");
                setShowLoginLink(false);
            }
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit}>
                <h2>Customer Signup</h2>

                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit">Sign Up</button>

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}
                {showLoginLink && (
                    <p>
                        Already have an account? <a href="/login">Login here</a>.
                    </p>
                )}
            </form>
        </div>
    );
};

export default CustomerSignup;
