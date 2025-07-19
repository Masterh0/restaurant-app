import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const AddFood = () => {
    const { auth } = useAuth();
    const [categories, setCategories] = useState([]);
    const [newDish, setNewDish] = useState({ name: "", description: "", price: "", category: "", image: null });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/categories/", {
                    headers: { Authorization: `Token ${auth.token}` },
                });
                setCategories(response.data);
            } catch (err) {
                setError("Failed to fetch categories.");
            }
        };
        fetchCategories();
    }, [auth.token]);

    const handleAddDish = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(newDish).forEach((key) => {
                if (newDish[key]) {
                    data.append(key, newDish[key]);
                }
            });
            await axios.post("http://127.0.0.1:8000/api/dishes/", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Token ${auth.token}`,
                },
            });
            setSuccess("Dish added successfully!");
            setNewDish({ name: "", description: "", price: "", category: "", image: null });
        } catch (err) {
            setError("Failed to add new dish.");
        }
    };

    return (
        <div className="add-food-container">
            <h1>Add Food</h1>
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddDish} className="add-dish-form">
                <div className="form-group">
                    <label htmlFor="name">Dish Name</label>
                    <input
                        type="text"
                        id="name"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={newDish.description}
                        onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        value={newDish.price}
                        onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={newDish.category}
                        onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={(e) => setNewDish({ ...newDish, image: e.target.files[0] })}
                    />
                </div>
                <button type="submit" className="submit-button">Add Dish</button>
            </form>
        </div>
    );
};

export default AddFood;
