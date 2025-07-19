import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./style.css";
import { useAuth } from "../../hooks/useAuth";

const DishCard = ({
  dish,
  onAdd,
  onRemove,
  quantity,
  onDetails,
  averageRating,
}) => {
  const [rating, setRating] = useState(0); // User-selected rating
  const [previousRating, setPreviousRating] = useState(0); // User's previous rating
  const [feedback, setFeedback] = useState(""); // Success/error feedback
  const [feedbackType, setFeedbackType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false); // Loading state for the rating submission
  const [isEditing, setIsEditing] = useState(false); // Whether the user is editing their rating
  const { auth } = useAuth(); // Authentication hook

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
        setPreviousRating(data.user_rating || 0); // Set previous rating if exists
        setRating(data.user_rating || 0); // Initialize rating to previous value
      })
      .catch((error) => {
        console.error("Error fetching previous rating:", error);
      });
  }, [dish.id, auth.token]);

  const handleRatingChange = (value) => {
    if (isEditing || previousRating === 0) {
      setRating(value);
    }
  };

  const submitRating = () => {
    setLoading(true);
    setFeedback(""); // Clear previous feedback

    const method = previousRating > 0 ? "PUT" : "POST"; // Use PUT if editing a previous rating
    const requestBody = {
      dish: dish.id,
      rating: rating,
    };

    fetch(`http://127.0.0.1:8000/api/rates/${dish.id}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${auth.token}`,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
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
        setIsEditing(false); // End editing mode
        setTimeout(() => setFeedback(""), 3000); // Hide feedback after 3 seconds
      })
      .catch((error) => {
        setFeedback(
          error.message || "Error submitting rating. Please try again."
        ); // Error message
        setFeedbackType("error"); // Set feedback type
        setLoading(false);
        setTimeout(() => setFeedback(""), 3000); // Hide feedback after 3 seconds
      });
  };

  return (
    <>
      {feedback && (
        <div
          className={`feedback-overlay ${
            feedbackType === "success" ? "success" : "error"
          }`}
        >
          <p>{feedback}</p>
        </div>
      )}

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
        <div className="average-rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFullStar = star <= Math.floor(dish.average_rating); // Full star if less than or equal to the rounded-down value
            const isHalfStar =
              star === Math.floor(dish.average_rating) + 1 &&
              dish.average_rating % 1 >= 0.5; // Half star if it's the next star and the rating has a fractional part >= 0.5
            const isEmptyStar = star > Math.ceil(dish.average_rating); // Empty star if greater than the rounded-up value

            return (
              <span
                key={star}
                className={`star ${isFullStar ? "full" : ""} ${
                  isHalfStar ? "half" : ""
                } ${isEmptyStar ? "empty" : ""}`}
              >
                ★
              </span>
            );
          })}
          <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
            {dish.average_rating
              ? Number(dish.average_rating).toFixed(1)
              : "0.0"}{" "}
            / 5
          </span>
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

          {/* Star Rating Input */}
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleRatingChange(star)} // Set rating on click
                style={{
                  cursor:
                    isEditing || previousRating === 0
                      ? "pointer"
                      : "not-allowed", // Enable clicks only if editing or no previous rating
                  color:
                    star <= (rating || previousRating) ? "#FFD700" : "#E0E0E0", // Gold for selected stars
                }}
              >
                ★
              </span>
            ))}
          </div>

          {/* Submit Rating Button */}
          {(previousRating === 0 || isEditing) && (
            <button
              className={`button is-success is-small mt-2 ${
                loading ? "is-loading" : ""
              }`}
              onClick={submitRating}
              disabled={rating === 0} // Disable if no rating is selected
            >
              Submit Rating
            </button>
          )}

          {/* Edit Rating Button */}
          {previousRating > 0 && !isEditing && (
            <button
              className="button is-warning is-small mt-2 ml-2"
              onClick={() => setIsEditing(true)} // Enable editing mode
            >
              Edit Rating
            </button>
          )}

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
