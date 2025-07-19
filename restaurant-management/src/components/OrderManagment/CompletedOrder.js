import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../node_modules/bulma/css/bulma.css";
import "./style.css";

const EmployeeCompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/completed-orders/", {
          headers: { Authorization: `Token ${token}` },
        });
        setCompletedOrders(response.data);
      } catch (err) {
        setError("Failed to fetch completed orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedOrders();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="title is-3 has-text-centered mb-6">Completed Orders</h1>
      <div className="columns is-multiline">
        {completedOrders.map((order) => (
          <div key={order.id} className="column is-one-quarter">
            <div className="card">
              <div className="card-content">
                <div className="media">
                  <div className="media-content">
                    <p className="title is-5">Order #{order.id}</p>
                    <p className="subtitle is-6 has-text-grey">Status: {order.status}</p>
                  </div>
                </div>

                <div className="content">
                  <p className="has-text-weight-semibold">
                    Total Price: ${typeof order.total_price === 'number' ? order.total_price.toFixed(2) : "N/A"}
                  </p>
                  <p>Address: {order.address || "N/A"}</p>
                  <p><strong>Items:</strong></p>
                  {order.items?.map((item, index) => (
                    <div key={index} className="mb-2">
                      <p>
                        {item.dish_name} - {item.quantity} x ${parseFloat(item.dish_price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCompletedOrders;
