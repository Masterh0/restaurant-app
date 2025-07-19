import React, { useState, useEffect } from "react";
import axios from "axios";
import "bulma/css/bulma.css"; // Import Bulma CSS
import { useAuth } from "../../hooks/useAuth";

const TopSoldDishes = () => {
  const [topSoldDishes, setTopSoldDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuth(); // Assuming auth contains token

  useEffect(() => {
    const fetchTopSoldDishes = async () => {
      setLoading(true);
      try {
        // Fetch data using auth token from the useAuth hook
        const response = await axios.get(
          "http://127.0.0.1:8000/api/top-solds/",
          {
            headers: {
              Authorization: `Token ${auth.token}`, // Use auth.token
            },
          }
        );

        // Log the response for debugging
        console.log("API Response:", response.data);

        // Check the response structure and use 'top_dishes' instead of 'top_solds'
        if (response.data && Array.isArray(response.data.top_dishes)) {
          setTopSoldDishes(response.data.top_dishes); // Set the dishes if they are available
        } else {
          setError("Invalid or empty data structure received.");
        }
      } catch (err) {
        setError("Failed to fetch top sold dishes.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchTopSoldDishes();
    } else {
      setError("No authentication token available.");
    }
  }, [auth]); // Fetch the data when the token changes or the component is mounted

  if (loading) return <div>Loading...</div>; // Show loading state
  if (error) return <div>{error}</div>; // Show error message

  if (topSoldDishes.length === 0) {
    return <div>No top sold dishes available.</div>; // Handle empty array case
  }

  return (
    <div className="container mt-5">
      <h1 className="title is-3 has-text-centered mb-6">Top Sold Dishes</h1>
      <div className="columns is-multiline">
        {topSoldDishes.map((dish) => (
          <div key={dish.id} className="column is-one-quarter">
            <div className="card">
              <div className="card-image">
                <figure className="image is-4by3">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    onError={(e) => (e.target.src = "default-image.jpg")} // Fallback image if the dish image fails to load
                  />
                </figure>
              </div>
              <div className="card-content">
                <p className="title is-5">{dish.name}</p>
                <p className="subtitle is-6">{dish.categoryName}</p>
                <p className="has-text-weight-semibold">
                  Price: ${parseFloat(dish.price).toFixed(2)}
                </p>
                <p className="content">
                  <strong>Description:</strong> {dish.description}
                </p>
                <p className="content">
                  <strong>Average Rating:</strong> {dish.average_rating} / 5
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSoldDishes;
