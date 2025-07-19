import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet } from "react-router-dom"; // Ensure you have this for navigation
import axios from "axios";
import "./CustomerPage.css"; // Custom styles
import { useAuth } from "../../hooks/useAuth";
import "../../../node_modules/bulma/css/bulma.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faLocationPin,
} from "@fortawesome/free-solid-svg-icons";
import AddressForm from "../../components/AddressForm"; // Import the AddressForm component
import Card from "../../components/DishCard/DishCard"; // Import the reusable Card component
import AddressModal from "../../components/AddressModal/AddressModal"; // Import the AddressModal component
import Order from "../../components/orederModal/OrderModal";
const FoodList = () => {
  const [dishes, setDishes] = useState([]); // All dishes
  const [popularDishes, setPopularDishes] = useState([]); // Top 5 popular dishes
  const [categories, setCategories] = useState([]); // Dish categories
  const { auth } = useAuth(); // Authentication hook
  const [currentCategory, setCurrentCategory] = useState("All"); // Current selected category
  const [cart, setCart] = useState([]); // Cart items
  const [visibleCategories, setVisibleCategories] = useState(["All"]); // Visible categories
  const categoryRefs = useRef([]); // Category refs for tabs
  const [showOrderSummary, setShowOrderSummary] = useState(false); // Order summary modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Dish details modal
  const [selectedDish, setSelectedDish] = useState(null); // Selected dish for modal
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // Address modal state
  const [selectedAddress, setSelectedAddress] = useState(null); // Selected address state
  const [cardAddress, setCardAddress] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/categories/",
          {
            headers: { Authorization: `Token ${auth.token}` },
          }
        );

        // Filter categories that have dishes in them
        const filteredCategories = response.data.filter((category) =>
          dishes.some((dish) => dish.categoryName === category.name)
        );
        setCategories([{ name: "All" }, ...filteredCategories]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [auth.token, dishes]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/customer-dishes/",
          {
            params: {
              category: visibleCategories.includes(currentCategory)
                ? currentCategory === "All"
                  ? ""
                  : currentCategory
                : "",
            },
            headers: { Authorization: `Token ${auth.token}` },
          }
        );

        setDishes(response.data); // Set all dishes

        // Fetch top 5 popular dishes
        const popularResponse = await axios.get(
          "http://127.0.0.1:8000/api/top-ordered-dishes/",
          {
            headers: { Authorization: `Token ${auth.token}` },
          }
        );

        // Set popular dishes using the new `top_dishes` data
        setPopularDishes(popularResponse.data.top_dishes || []);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };

    fetchDishes();
  }, [currentCategory, auth.token, visibleCategories]);
  useEffect(() => {
    const fetchCardAddress = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/addresses/",
          {
            headers: { Authorization: `Token ${auth.token}` },
          }
        );

        // Check if response has the expected data
        if (response.data.addresses && response.data.addresses.length > 0) {
          setCardAddress(response.data.addresses[0]); // assuming it's an array, adjust accordingly
        } else {
          setCardAddress(null); // handle case where no address is found
        }
      } catch (error) {
        console.error("Error fetching card address:", error);
      }
    };

    fetchCardAddress();
  }, [auth.token]);

  const addToCart = (dish, quantity) => {
    const existingItem = cart.find((item) => item.id === dish.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...dish, quantity }]);
    }
  };

  const removeFromCart = (dishId) => {
    const existingItem = cart.find((item) => item.id === dishId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === dishId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.id !== dishId));
    }
  };

  const handleCategoryChange = (category) => {
    if (!visibleCategories.includes(category)) {
      setVisibleCategories([...visibleCategories, category]);
    }
    setCurrentCategory(category);
  };

  const handleShowOrderSummary = () => {
    setShowOrderSummary(true);
  };

  const handleCloseOrderSummary = () => {
    setShowOrderSummary(false);
  };

  const handleOrderComplete = async (confirmedAddress) => {
    try {
      const orderData = {
        address: confirmedAddress,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };

      await axios.post("http://127.0.0.1:8000/api/complete-order/", orderData, {
        headers: { Authorization: `Token ${auth.token}` },
      });

      setSuccessMessage("Order placed successfully!");
      setCart([]); // Reset the cart
      setShowOrderSummary(false); // Close the order summary modal

      setTimeout(() => {
        setSuccessMessage(""); // Hide success message after 3 seconds
      }, 3000);
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const handleOpenModal = (dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDish(null);
    setIsModalOpen(false);
  };

  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    handleCloseAddressModal(); // Close the address modal after selection
  };

  return (
    <div className="container mt-5 FoodList">
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <Link
          to="/customer/orders" // Correct path to navigate to the OrderList component
          className="button is-link"
          style={{
            padding: "10px 15px",
            backgroundColor: "#007BFF",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          My Orders
        </Link>
        <Link
          to="/customer/orders/completed" // Example path for the second link
          className="button is-link"
          style={{
            padding: "10px 15px",
            backgroundColor: "#28A745", // Green color for the second button
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          My last order
        </Link>
      </div>
      {successMessage && (
        <div className="notification is-success">{successMessage}</div>
      )}

      {cart.length > 0 && (
        <button
          onClick={handleShowOrderSummary}
          style={{
            position: "fixed",
            top: "20px", // Adjust top position to suit your needs
            left: "20px", // Adjust left position to suit your needs
            zIndex: 1000,
            padding: "0",
            background: "none",
            border: "none",
            outline: "none",
            cursor: "pointer",
            float: "left",
          }}
        >
          <FontAwesomeIcon
            style={{
              position: "fixed",
              top: "20px", // Adjust top position to suit your needs
              left: "20px", // Adjust left position to suit your needs
              zIndex: 1000,
              padding: "0",
              background: "none",
              border: "none",
              outline: "none",
              cursor: "pointer",
              float: "left",
            }}
            icon={faShoppingBag}
            size="3x"
            color="#007BFF"
          />
        </button>
      )}

      {/* Order Component */}
      <Order
        cart={cart}
        auth={auth}
        setCart={setCart}
        setSuccessMessage={setSuccessMessage}
        showOrderSummary={showOrderSummary}
        handleCloseOrderSummary={handleCloseOrderSummary}
      />

      {/* Address Link Box */}
      <div
        className="address-link-box"
        style={{
          right: "20px",
          top: "20px",
          padding: "10px 15px",
          backgroundColor: "#f8f8f8",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        onClick={handleOpenAddressModal} // Open modal on click
      >
        <FontAwesomeIcon
          icon={faLocationPin}
          size="lg"
          style={{ color: "#007BFF" }}
        />
        <span style={{ color: "#007BFF", fontWeight: "bold" }}>
          Add Address
        </span>
      </div>

      {/* Display Top 5 Popular Dishes */}
      <div className="columns is-multiline mt-5">
        <div className="column is-full">
          <h2 className="title is-4">Most Popular Dishes</h2>
          <div className="columns is-multiline">
            {popularDishes.length > 0 ? (
              popularDishes.map((dish) => (
                <div className="column is-one-quarter" key={dish.id}>
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
                      <p className="subtitle is-6">
                        ${Number(dish.price).toFixed(2)}
                      </p>
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
                      <footer className="card-footer">
                        <div className="card-footer-item">
                          <button
                            className="button is-info is-small"
                            onClick={() => addToCart(dish, 1)}
                          >
                            +
                          </button>
                          <span className="mx-2">
                            {cart.find((item) => item.id === dish.id)
                              ?.quantity || 0}
                          </span>
                          <button
                            className="button is-danger is-small"
                            onClick={() => removeFromCart(dish.id)}
                            disabled={!cart.find((item) => item.id === dish.id)}
                          >
                            -
                          </button>
                          <button
                            className="button is-primary is-small"
                            onClick={() => handleOpenModal(dish)}
                          >
                            Details
                          </button>
                        </div>
                      </footer>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Loading popular dishes...</p>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="panel-heading">Categories</p>
        <div className="panel-tabs">
          {categories.map((category, index) => (
            <a
              key={category.id}
              ref={(el) => (categoryRefs.current[index] = el)}
              data-category={category.name}
              className={`panel-tab ${
                currentCategory === category.name ? "is-active" : ""
              }`}
              onClick={() => handleCategoryChange(category.name)}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      <div className="columns is-multiline mt-5">
        {dishes.map((dish) => (
          <div
            className={`column is-one-quarter ${
              !visibleCategories.includes(dish.categoryName) ? "hidden" : ""
            }`}
            key={dish.id}
          >
            <Card
              dish={dish}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onDetails={handleOpenModal}
              quantity={cart.find((item) => item.id === dish.id)?.quantity || 0}
            />
          </div>
        ))}
      </div>

      {isModalOpen && selectedDish && (
        <div className="modal is-active">
          <div className="modal-background" onClick={handleCloseModal}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{selectedDish.name}</p>
              <button
                className="delete"
                aria-label="close"
                onClick={handleCloseModal}
              ></button>
            </header>
            <section className="modal-card-body">
              {/* Displaying the dish image */}
              <figure
                className="image"
                style={{ textAlign: "center", marginBottom: "1rem" }}
              >
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    maxWidth: "400px", // Ensures the image doesn't get too large
                    height: "auto", // Keeps the aspect ratio intact
                    borderRadius: "8px", // Adds rounded corners for a modern look
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for better contrast
                  }}
                />
              </figure>

              <p>{selectedDish.description}</p>
              <p>
                <strong>Price:</strong> ${Number(selectedDish.price).toFixed(2)}
              </p>
              <p>
                <strong>Category:</strong> {selectedDish.categoryName}
              </p>
            </section>
          </div>
        </div>
      )}

      {/* {showOrderSummary && (
        <div className={`modal is-active`}>
          <div
            className="modal-background"
            onClick={handleCloseOrderSummary}
          ></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Order Summary</p>
              <button
                className="delete"
                aria-label="close"
                onClick={handleCloseOrderSummary}
              >
                {" "}
              </button>
            </header>
            <section className="modal-card-body">
              <div className="cart-summary">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <p>{item.name}</p>
                    <p>
                      {item.quantity} x ${item.price}
                    </p>
                  </div>
                ))}
                <div className="total">
                  <strong>Total:</strong> $
                  {cart
                    .reduce(
                      (total, item) => total + item.price * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-primary"
                onClick={() => handleOrderComplete(selectedAddress)}
                disabled={!selectedAddress}
              >
                Confirm Order
              </button>
              <button className="button" onClick={handleCloseOrderSummary}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )} */}

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={handleCloseAddressModal}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  );
};

export default FoodList;
