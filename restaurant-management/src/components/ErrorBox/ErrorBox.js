import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./style.css";
import { useAuth } from "../../hooks/useAuth";
import ErrorModal from "../ErrorBox/ErrorBox"; // Import the ErrorModal component

const DishCard = ({ dish, onAdd, onRemove, quantity, onDetails }) => {
  const [rating, setRating] = useState(0); // User-selected rating
  const [previousRating, setPreviousRating] = useState(0); // User's previous rating
  const [feedback, setFeedback] = useState(""); // Success/error feedback
  const [feedbackType, setFeedbackType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false); // Loading state for the rating submission
  const { auth } = useAuth(); // Authentication hook
  const [showErrorModal, setShowErrorModal] = useState(false); // Modal visibility state
  const [errorMessage, setErrorMessage] = useState(""); // Error message for modal

  // Fetch the user's previous rating when the component mounts
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/rates/${dish.id}`, {
      method: "GET",
      headers: {
        Authorization: `Token ${auth.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch previous rating");
        }
        return response.json();
      })
      .then((data) => {
        setPreviousRating(data.rating || 0); // Set previous rating if exists
        setRating(data.rating || 0); // Initialize rating to previous value
      })
      .catch((error) => {
        console.error("Error fetching previous rating:", error);
      });
  }, [dish.id, auth.token]);

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const submitRating = () => {
    setLoading(true);
    setFeedback(""); // Clear previous feedback

    const requestBody = {
      dish: dish.id,
      rating: rating,
    };

    fetch(`http://127.0.0.1:8000/api/rates/${dish.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${auth.token}`,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            // Display error modal with appropriate message
            setErrorMessage(data.detail || "Failed to submit rating");
            setShowErrorModal(true); // Show error modal
            throw new Error(data.detail || "Failed to submit rating");
          });
        }
        return response.json();
      })
      .then(() => {
        setFeedback("Thank you for your rating!"); // Success message
        setFeedbackType("success"); // Set feedback type
        setPreviousRating(rating); // Update previous rating
        setLoading(false);
        setTimeout(() => setFeedback(""), 3000); // Hide feedback after 3 seconds
      })
      .catch((error) => {
        // This will be triggered if the fetch fails or we throw an error manually
        console.error("Error submitting rating:", error);
        setLoading(false);
        setTimeout(() => setFeedback(""), 3000); // Hide feedback after 3 seconds
      });
  };

  const closeErrorModal = () => {
    setShowErrorModal(false); // Close the error modal
  };

  return (
    <>
      {/* Show error modal if there's an error */}
      <ErrorModal
        show={showErrorModal}
        message={errorMessage}
        onClose={closeErrorModal}
      />

      <div className="card">
        <div className="card-image">
          <figure className="image is-4by3">
            <img
              src={dish.image || "https://via.placeholder.com/150"}
              alt={dish.name}
              style={{ objectFit: "cover" }}
            />
          </figure>
        </div>
        <div className="card-content">
          <p className="title is-5">{dish.name}</p>
          <p className="subtitle is-6">${Number(dish.price).toFixed(2)}</p>
          <p
            className="content"
            style={{
              maxHeight: "60px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {dish.description}
          </p>

          {/* Star Rating Display */}
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRatingChange(star)} // Set rating on click
                style={{
                  cursor: "pointer",
                  color:
                    star <= (rating || previousRating) ? "#FFD700" : "#E0E0E0", // Gold for selected stars
                }}
              >
                ★
              </span>
            ))}
          </div>

          {/* Submit Rating Button */}
          <button
            className={`button is-success is-small mt-2 ${loading ? "is-loading" : ""}`}
            onClick={submitRating}
            disabled={rating === 0 || previousRating > 0} // Disable the button if no rating is selected or already rated
          >
            Submit Rating
          </button>

          <footer className="card-footer">
            <div className="card-footer-item">
              <button
                className="button is-info is-small"
                onClick={() => onAdd(dish, 1)}
              >
                +
              </button>
              <span className="mx-2">{quantity}</span>
              <button
                className="button is-danger is-small"
                onClick={() => onRemove(dish.id)}
                disabled={quantity === 0}
              >
                -
              </button>
              <button
                className="button is-primary is-small"
                onClick={() => onDetails(dish)}
              >
                Details
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

// Prop validation for better maintainability
DishCard.propTypes = {
  dish: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  quantity: PropTypes.number.isRequired,
  onDetails: PropTypes.func.isRequired,
};

export default DishCard;
