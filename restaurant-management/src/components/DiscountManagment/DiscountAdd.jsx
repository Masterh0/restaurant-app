import React, { useState } from "react";
import axios from "axios";
import "./DiscountAdd.css";
import { useAuth } from "../../hooks/useAuth";

const AddDiscount = () => {
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [maxUsagePerUser, setMaxUsagePerUser] = useState(1); // New state for max usage per user
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { auth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!code || !discountPercentage || !expirationDate) {
      setError("All fields are required.");
      return;
    }

    // Check if the expiration date is in the future
    const currentDate = new Date();
    if (new Date(expirationDate) <= currentDate) {
      setError("Expiration date must be in the future.");
      return;
    }

    try {
      // Prepare the discount code data
      const discountData = {
        code: code,
        discount_percentage: discountPercentage,
        expiration_date: expirationDate,
        is_active: isActive,
        max_usage_per_user: maxUsagePerUser, // Include max_usage_per_user
      };

      // Send the POST request to the backend
      const response = await axios.post(
        "http://127.0.0.1:8000/api/discount-codes/",
        discountData,
        {
          headers: { Authorization: `Token ${auth.token}` }, // Include the token for authentication
        }
      );

      // Success response
      setSuccess("Discount code added successfully!");
      setError(null);
      setCode("");
      setDiscountPercentage("");
      setExpirationDate("");
      setIsActive(true);
      setMaxUsagePerUser(1); // Reset max_usage_per_user to 1 after successful submit
    } catch (err) {
      // Handle error
      console.error("Error adding discount code:", err);
      setError("There was an error creating the discount code.");
      setSuccess(null);
    }
  };

  // Reset the success message after 3 seconds
  setTimeout(() => {
    setSuccess(""); // Reset the success message
  }, 3000);

  return (
    <div>
      <h2>Add Discount Code</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter discount code"
          />
        </div>

        <div>
          <label>Discount Percentage:</label>
          <input
            type="number"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            placeholder="Enter discount percentage"
          />
        </div>

        <div>
          <label>Expiration Date:</label>
          <input
            type="datetime-local"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        <div>
          <label>Active:</label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
        </div>

        {/* New input field for max_usage_per_user */}
        <div>
          <label>Max Usage Per User:</label>
          <input
            type="number"
            value={maxUsagePerUser}
            onChange={(e) => setMaxUsagePerUser(e.target.value)}
            placeholder="Enter max usage per user"
          />
        </div>

        <button type="submit">Add Discount</button>
      </form>
    </div>
  );
};

export default AddDiscount;
