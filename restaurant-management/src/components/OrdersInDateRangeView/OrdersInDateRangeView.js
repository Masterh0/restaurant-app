import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth"; // Import the useAuth hook
import { FaSpinner } from "react-icons/fa"; // Import spinner icon for loading

const OrdersReport = () => {
  const { auth } = useAuth(); // Get the auth object from the context
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleFetchData = async (page = 1) => {
    if (!startDate || !endDate) {
      setError("Please enter both start and end dates.");
      return;
    }

    if (!auth || !auth.token) {
      setError("You are not authenticated.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/orders-in-date-range/", {
        params: { start_date: startDate, end_date: endDate, page: page },
        headers: {
          Authorization: `Token ${auth.token}` // Use token from the useAuth hook
        }
      });

      setOrders(response.data.orders);
      setTotalRevenue(response.data.total_revenue);
      setTotalPages(response.data.count / 10); // Calculate total pages (assuming 10 items per page)
      setCurrentPage(page); // Update the current page
    } catch (err) {
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    handleFetchData(page);
  };

  return (
    <div className="container">
      <h1 className="title is-3">Orders Report</h1>

      {/* Date Range Inputs */}
      <div className="field">
        <label className="label" htmlFor="start-date">Start Date:</label>
        <div className="control">
          <input
            className="input"
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="end-date">End Date:</label>
        <div className="control">
          <input
            className="input"
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <div className="control">
          <button className="button is-primary is-fullwidth" onClick={() => handleFetchData(1)} disabled={loading}>
            {loading ? <FaSpinner className="fa-spin" /> : "Fetch Orders"}
          </button>
        </div>
      </div>

      {error && (
        <div className="notification is-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {orders.length > 0 && (
        <>
          <h2 className="subtitle is-4">
            Total Revenue: ${totalRevenue.toFixed(2)}
          </h2>
          <div className="table-container">
            <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Dish Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.dish_name}</td>
                    <td>{order.quantity}</td>
                    <td>${parseFloat(order.dish_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {orders.length === 0 && !loading && (
        <div className="notification is-info">
          No orders found for the selected date range.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="pagination is-centered" role="navigation" aria-label="pagination">
          <button
            className={`pagination-previous ${currentPage === 1 ? 'is-disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`pagination-next ${currentPage === totalPages ? 'is-disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <p className="pagination-total">{`Page ${currentPage} of ${Math.ceil(totalPages)}`}</p>
        </nav>
      )}
    </div>
  );
};

export default OrdersReport;
