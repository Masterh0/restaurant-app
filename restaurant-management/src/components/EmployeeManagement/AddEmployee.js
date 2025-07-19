import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import "../../../node_modules/bulma/css/bulma.css"
import "./style.css"
const AddEmployee = ({ onEmployeeAdded }) => {
  const { auth } = useAuth();

  const [newEmployee, setNewEmployee] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "employee",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        username: newEmployee.username,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role || "employee",
      };

      if (newEmployee.first_name) {
        employeeData.first_name = newEmployee.first_name;
      }
      if (newEmployee.last_name) {
        employeeData.last_name = newEmployee.last_name;
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/employee/",
        employeeData,
        { headers: { Authorization: `Token ${auth.token}` } }
      );

      onEmployeeAdded(response.data);
      console.log("Employee added:", response.data);
      // تنظیم پیام موفقیت
      setSuccessMessage("Employee added successfully!");
setNewEmployee({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  role: "employee",
});
setTimeout(() => setSuccessMessage(""), 3000);
} catch (err) {
    console.error("Failed to add new employee:", err);
    // می‌توانید پیام خطا به حالت کاربر نمایش دهید.
  }
  };

  return (
    <div>
      {/* نمایش پیام موفقیت */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleAddEmployee} className="add-employee-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={newEmployee.username}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, username: e.target.value })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="First Name"
            value={newEmployee.first_name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, first_name: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Last Name"
            value={newEmployee.last_name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, last_name: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={newEmployee.password}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, password: e.target.value })
            }
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Employee
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
