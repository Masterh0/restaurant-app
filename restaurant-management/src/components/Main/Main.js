import React from "react";
import { useNavigate } from "react-router-dom";
import './MainPage.css';

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="main-container">
            <div className="content">
                <h1>Welcome to Our Platform!</h1>
                <p>Choose an option to get started:</p>
                <div className="form-container">
                    <div className="buttons">
                        <button className="button is-link" onClick={() => navigate('/login')}>
                            Log In
                        </button>
                        <button className="button is-link" onClick={() => navigate('/signup')}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
