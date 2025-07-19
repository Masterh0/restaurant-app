import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationPin, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";

const AddressModal = ({ isOpen, onClose }) => {
  const { auth } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: "",
    area: "",
  });
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/addresses/",
          {
            headers: { Authorization: `Token ${auth.token}` },
          }
        );
        setAddresses(response.data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen, auth.token]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/addresses/",
        newAddress,
        {
          headers: { Authorization: `Token ${auth.token}` },
        }
      );
      setAddresses([...addresses, response.data]);
      setNewAddress({ street: "", area: "" });
      setIsAddingNewAddress(false);
    } catch (error) {
      console.error("Error adding address:", error);
    }
  };

  return (
    <div className={`modal ${isOpen ? "is-active" : ""}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header
          className="modal-card-head"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <p
            className="modal-card-title"
            style={{ color: "#4CAF50", fontWeight: "bold" }}
          >
            Your Addresses
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body" style={{ padding: "20px 25px" }}>
          {/* Display previous addresses */}
          <div className="address-list">
            <h2 className="title is-5" style={{ marginBottom: "15px" }}>
              Saved Addresses
            </h2>
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="address-item"
                  style={{
                    padding: "10px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faLocationPin}
                    style={{ marginRight: "10px", color: "#4CAF50" }}
                  />
                  <span style={{ fontWeight: "500", color: "#333" }}>
                    {address.street}, {address.area}
                  </span>
                </div>
              ))
            ) : (
              <p className="has-text-grey">No saved addresses found.</p>
            )}
          </div>

          {/* Add new address form */}
          {isAddingNewAddress && (
            <form onSubmit={handleAddNewAddress} className="new-address-form">
              <h2 className="title is-5" style={{ marginTop: "20px" }}>
                Add New Address
              </h2>
              <div className="field">
                <label className="label">Street</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter street"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Area</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter area"
                    value={newAddress.area}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, area: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="field is-grouped" style={{ marginTop: "20px" }}>
                <div className="control" style={{ flex: 1 }}>
                  <button
                    type="submit"
                    className="button"
                    style={{
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      border: "none",
                      width: "100%",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#45A049")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#4CAF50")
                    }
                  >
                    Save Address
                  </button>
                </div>
                <div
                  className="control"
                  style={{ flex: 1, marginLeft: "10px" }}
                >
                  <button
                    type="button"
                    className="button"
                    style={{
                      backgroundColor: "#F8F8F8",
                      color: "#888",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      border: "1px solid #CCC",
                      width: "100%",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#EEE")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#F8F8F8")
                    }
                    onClick={() => setIsAddingNewAddress(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* Fixed Add Address Button */}
        <footer
          className="modal-card-foot"
          style={{
            position: "sticky",
            bottom: "0",
            backgroundColor: "#fff",
            boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
            padding: "15px",
          }}
        >
          {!isAddingNewAddress && (
            <button
              className="button is-primary is-fullwidth"
              onClick={() => setIsAddingNewAddress(true)}
              style={{
                backgroundColor: "#4CAF50",
                color: "#fff",
                fontWeight: "bold",
                padding: "12px",
                fontSize: "16px",
              }}
            >
              <FontAwesomeIcon
                icon={faPlusCircle}
                style={{ marginRight: "10px", color: "#fff" }}
              />
              Add Address
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AddressModal;
