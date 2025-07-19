import React, { useState, useEffect } from "react";
import axios from "axios";
import "bulma/css/bulma.css";
import "./style.css";

const EmployeeOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/orders/", {
          headers: { Authorization: `Token ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const handleCompleteOrder = async (orderId) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/orders/${orderId}/update-status/`,
        { status: "completed" },
        { headers: { Authorization: `Token ${token}` } }
      );
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "completed" } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err.response?.data || err.message);
      setError("Failed to update order status.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="title">Orders</h1>
      <div className="columns is-multiline">
        {orders.map((order) => (
          <div key={order.id} className="column is-one-quarter">
            <div className="card">
              <div className="card-content">
                <p className="title is-5">Order #{order.id}</p>
                <p className="subtitle has-text-grey">Status: {order.status}</p>
                <p className="has-text-weight-semibold">
                  Total Price: ${typeof order.total_price === 'number' ? order.total_price.toFixed(2) : "N/A"}
                </p>
                <p>Address: {order.address || "N/A"}</p>
                <div className="content">
                  <p><strong>Items:</strong></p>
                  {order.items.map((item, index) => (
                    <div key={index} className="mb-2">
                      <p>
                        {item.dish_name} - {item.quantity} x ${parseFloat(item.dish_price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  className="button is-primary mt-3 is-fullwidth"
                  onClick={() => handleCompleteOrder(order.id)}
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeOrders;
