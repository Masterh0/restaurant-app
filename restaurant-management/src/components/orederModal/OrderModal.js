import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import { useAuth } from "../../hooks/useAuth";

const Order = ({
  cart,
  setCart,
  setSuccessMessage,
  showOrderSummary,
  handleCloseOrderSummary,
}) => {
  const { auth } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  // Fetch user's addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/addresses/",
          { headers: { Authorization: `Token ${auth.token}` } }
        );
        const addresses = response.data.addresses || response.data;
        console.log("Fetched Addresses:", addresses); // Log fetched addresses
        setAddresses(addresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, [auth.token]);

  // Calculate the total and discounted prices whenever cart or discount changes
  useEffect(() => {
    const calculateDiscountedPrice = () => {
      const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const newDiscountedPrice =
        discountPercentage > 0
          ? (totalPrice * (100 - discountPercentage)) / 100
          : totalPrice;
      console.log("Total Price:", totalPrice);
      console.log("Discounted Price:", newDiscountedPrice);
      setDiscountedPrice(newDiscountedPrice);
    };
    calculateDiscountedPrice();
  }, [cart, discountPercentage]);

  // Handle discount code submission
  const handleApplyDiscountCode = async () => {
    console.log("Applying Discount Code:", discountCode); // Log to check the code before sending

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/apply-discount/",
        { code: discountCode.trim() }, // Ensure there's no extra space
        { headers: { Authorization: `Token ${auth.token}` } }
      );
      const discountPercentage = response.data.discount_percentage || 0;
      setDiscountPercentage(discountPercentage);
      alert("Discount code applied successfully!");
    } catch (error) {
      console.error("Error applying discount code:", error);
      if (error.response) {
        // If the error response exists, log and display the error message
        console.log("Error details:", error.response.data);
        if (
          error.response.data.code &&
          Array.isArray(error.response.data.code)
        ) {
          alert(
            `Failed to apply discount code: ${error.response.data.code[0]}`
          );
        } else {
          alert("Failed to apply discount code. Please check and try again.");
        }
      } else {
        alert("Failed to apply discount code. Please check and try again.");
      }
    }
  };

  // Handle order submission
  const handleOrderComplete = async () => {
    if (!selectedAddress) {
      alert("Please select an address.");
      return;
    }

    // Recalculate the discounted price to ensure it is accurate
    const totalPrice = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const finalDiscountedPrice =
      discountPercentage > 0
        ? (totalPrice * (100 - discountPercentage)) / 100
        : totalPrice;

    console.log("Order Total Price Before Discount:", totalPrice);
    console.log("Final Price After Discount:", finalDiscountedPrice);

    try {
      const orderData = {
        address: selectedAddress,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        discount_code: discountCode,
        total_price: finalDiscountedPrice, // Send recalculated discounted price
      };

      console.log("Sending Order Data:", orderData);

      await axios.post("http://127.0.0.1:8000/api/complete-order/", orderData, {
        headers: { Authorization: `Token ${auth.token}` },
      });

      setSuccessMessage("Order placed successfully!");
      setCart([]);
      setDiscountCode("");
      setDiscountPercentage(0);
      setDiscountedPrice(0);
      handleCloseOrderSummary();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Failed to place the order. Please try again.");
    }
  };

  return (
    <>
      {showOrderSummary && (
        <div className="modal is-active">
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
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="cart-summary">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                      />
                    </div>
                    <div className="cart-item-details">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-quantity">
                        {item.quantity} x ${item.price}
                      </p>
                    </div>
                    <div className="cart-item-total">
                      <p className="cart-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="total">
                  <strong>Total:</strong> ${discountedPrice.toFixed(2)}
                </div>
              </div>

              {/* Address Selection */}
              <div className="address-selection">
                <p>Select your address:</p>
                {addresses.length > 0 ? (
                  <div className="select">
                    <select
                      value={selectedAddress || ""}
                      onChange={(e) =>
                        setSelectedAddress(Number(e.target.value))
                      }
                    >
                      <option value="" disabled>
                        -- Select an address --
                      </option>
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.street}, {address.area}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p>No addresses available.</p>
                )}
              </div>

              {/* Discount Code Input */}
              <div className="discount-code">
                <p>Enter Discount Code:</p>
                <input
                  type="text"
                  className="input"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter your code here"
                />
                <button
                  className="button is-primary"
                  onClick={handleApplyDiscountCode}
                >
                  Apply
                </button>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-primary"
                onClick={handleOrderComplete}
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
      )}
    </>
  );
};

export default Order;
