import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../../node_modules/bulma/css/bulma.css";
import "./EditDeleteFood.css";

const EditDeleteFood = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [dishes, setDishes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingDishId, setEditingDishId] = useState(null);
  const [formData, setFormData] = useState({});
  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dishesResponse, categoriesResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/dishes/", {
            headers: { Authorization: `Token ${auth.token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/categories/", {
            headers: { Authorization: `Token ${auth.token}` },
          }),
        ]);
        setDishes(dishesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth.token]);

  const handleEditClick = (dish) => {
    setEditingDishId(dish.id);
    setFormData({
      name: dish.name,
      description: dish.description,
      category: dish.category.id,
      price: dish.price,
      image: null,
    });
  };

  const handleSaveClick = async (id) => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image" && !formData[key]) return; // Skip image if not changed
        data.append(key, formData[key]);
      });
      const response = await axios.put(
        `http://127.0.0.1:8000/api/dishes/${id}/`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${auth.token}`,
          },
        }
      );
      setDishes(dishes.map((dish) => (dish.id === id ? response.data : dish)));
      setEditingDishId(null); // Reset editing state
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/dishes/${id}/`, {
        headers: { Authorization: `Token ${auth.token}` },
      });
      setDishes(dishes.filter((dish) => dish.id !== id)); // Remove deleted dish from state
    } catch (err) {
      console.error("Failed to delete dish:", err);
      setError("Failed to delete dish. Please try again.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dish-list-container">
      <h1>Dish Management</h1>
      <div className="card-container">
        {dishes.map((dish) => (
          <div key={dish.id} className="card">
            <div className="card-image">
              <figure className="image is-4by3">
                <img src={dish.image} alt={dish.name} />
              </figure>
            </div>
            <div className="card-content">
              <div className="media">
                <div className="media-content">
                  <p className="title is-4">{dish.name}</p>
                  <p className="subtitle is-6">{dish.category.name}</p>
                </div>
              </div>

              <div className="content">
                {dish.description}
                <br />
                <strong>Price: {dish.price}</strong>
                <br />
                <time datetime={dish.created_at}>
                  {new Date(dish.created_at).toLocaleDateString()}
                </time>
              </div>

              <div className="dish-actions">
                <button
                  onClick={() => handleEditClick(dish)}
                  className="button is-primary is-small Edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(dish.id)}
                  className="button is-danger is-small"
                >
                  Delete
                </button>
                {editingDishId === dish.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveClick(dish.id);
                    }}
                    className="edit-dish-form"
                  >
                    <div className="form-group">
                      <label htmlFor="edit-name">Dish Name</label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-description">Description</label>
                      <textarea
                        id="edit-description"
                        name="description"
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-price">Price</label>
                      <input
                        type="number"
                        id="edit-price"
                        name="price"
                        value={formData.price || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-category">Category</label>
                      <select
                        id="edit-category"
                        name="category"
                        value={formData.category || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
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
                      <label htmlFor="edit-image">Image</label>
                      <input
                        type="file"
                        id="edit-image"
                        name="image"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.files[0] })
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      className="button is-success is-small"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDishId(null)}
                      className="button is-danger is-small"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditDeleteFood;
