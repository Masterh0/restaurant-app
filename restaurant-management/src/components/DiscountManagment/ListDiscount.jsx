import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DiscountAdd.css";
import { useAuth } from "../../hooks/useAuth";

const DiscountList = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [error, setError] = useState(null);
  const { auth } = useAuth();
  // Fetch discount codes on component mount
  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/discount-codes/",
          {
            headers: {
              Authorization: `Token ${auth.token}`,
            },
          }
        );
        setDiscountCodes(response.data);
      } catch (err) {
        console.error("Error fetching discount codes:", err);
        setError("Error fetching discount codes.");
      }
    };

    fetchDiscountCodes();
  }, [auth.token]);

  return (
    <div className="discount-list-container">
      {error && <div className="error-message">{error}</div>}
      {discountCodes.length === 0 ? (
        <div className="no-discounts">No discount codes available.</div>
      ) : (
        <table className="discount-codes-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount Percentage</th>
              <th>Expiration Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {discountCodes.map((discount) => (
              <tr key={discount.id}>
                <td>{discount.code}</td>
                <td>{discount.discount_percentage}%</td>
                <td>
                  {new Date(discount.expiration_date).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`status ${
                      discount.is_active ? "active" : "inactive"
                    }`}
                  >
                    {discount.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DiscountList;
