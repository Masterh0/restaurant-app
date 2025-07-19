import React, { useState } from "react";

const AddressForm = ({ onSubmit }) => {
  const [address, setAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAddress, setConfirmedAddress] = useState("");

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleConfirmClick = () => {
    setConfirmedAddress(address);
    setShowConfirmation(true);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(confirmedAddress); // Call the onSubmit function with confirmed address
    }
  };

  return (
    <div className="field">
      <label className="label">Address</label>
      <div className="control">
        <input
          className="input"
          type="text"
          placeholder="Enter your address"
          value={address}
          onChange={handleAddressChange}
        />
      </div>

      <div className="control">
        <button className="button is-info mt-2" onClick={handleConfirmClick}>
          Confirm Address
        </button>
      </div>

      {showConfirmation && (
        <div className="confirmation">
          <p className="mt-2">Confirmed Address: {confirmedAddress}</p>
          <button className="button is-warning mt-2" onClick={handleSubmit}>
            Confirm & Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
