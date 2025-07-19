import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import "./style.css";

const OrderList = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch pending orders
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/orders/pending/", {
          headers: { Authorization: `Token ${auth.token}` },
        });
        setOrders(response.data); // Ensure the backend provides `pending_at` in the response
      } catch (err) {
        console.error("Error fetching pending orders:", err);
        setError("Failed to load pending orders. Please try again.");
      }
    };

    fetchPendingOrders();
  }, [auth.token]);

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/orders/cancel/",
        { order_id: orderId },
        { headers: { Authorization: `Token ${auth.token}` } }
      );
      setSuccessMessage(response.data.message);

      // Remove the canceled order from the list
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error canceling order:", err);
      setError("Failed to cancel the order. Please try again.");
    }
  };

  // Determine if the cancel button should be shown
  const canCancel = (pendingAt) => {
    if (!pendingAt) return false; // If no `pending_at` timestamp, don't allow cancellation

    const pendingTime = new Date(pendingAt).getTime();
    const currentTime = Date.now();
    return currentTime - pendingTime <= 30 * 60 * 1000; // 30 minutes in milliseconds
  };

  return (
    <div className="order-list">
      <h2>Pending Orders</h2>
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
              <th>Pending At</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.address}</td>
                <td>${order.total_price.toFixed(2)}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.pending_at ? new Date(order.pending_at).toLocaleString() : "N/A"}</td>
                <td>
                  {/* Display the order items */}
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <span>
                        <strong>{item.dish_name}</strong>: {item.quantity}
                      </span>
                    </div>
                  ))}
                </td>
                <td>
                  {canCancel(order.pending_at) ? (
                    <button
                      className="button is-danger"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  ) : (
                    <span>Not cancelable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending orders available.</p>
      )}
    </div>
  );
};

export default OrderList;
