import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth"; // Assuming you have a custom hook for authentication
import "./style.css"; // Add your styles here

const CompletedOrders = () => {
  const { auth } = useAuth();  // Assuming 'auth' provides the authenticated user's info (including token)
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch completed orders on component mount
  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/orders/completed/", {
          headers: { Authorization: `Token ${auth.token}` },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching completed orders:", err);
        setError("Failed to load completed orders. Please try again.");
      }
    };

    fetchCompletedOrders();
  }, [auth.token]);

  return (
    <div className="order-list">
      <h2>Completed Orders</h2>
      {successMessage && <div className="notification is-success">{successMessage}</div>}
      {error && <div className="notification is-danger">{error}</div>}

      {orders.length > 0 ? (
        <table className="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Address</th>
              <th>Total Price</th>
              <th>Created At</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.address}</td>
                <td>${order.total_price.toFixed(2)}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.dish_name} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No completed orders available.</p>
      )}
    </div>
  );
};

export default CompletedOrders;
