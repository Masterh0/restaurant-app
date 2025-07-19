import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const EmployeeList = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [formData, setFormData] = useState({});
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "employee",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!auth || auth.role !== "manager") {
      navigate("/login");
    }
  }, [auth, navigate]);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/employee/",
          { headers: { Authorization: `Token ${auth.token}` } }
        );
        setEmployees(response.data);
      } catch (err) {
        setError("Failed to fetch employees. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [auth.token]);

  const handleEditClick = (employee) => {
    setEditingEmployeeId(employee.id);
    setFormData({
      username: employee.username,
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email,
    });
  };

  const handleSaveClick = async (id) => {
    try {
      const updatedEmployee = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        new_password: formData.new_password || null,
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/employee/${id}/`,
        updatedEmployee,
        { headers: { Authorization: `Token ${auth.token}` } }
      );

      setEmployees(
        employees.map((emp) => (emp.id === id ? response.data : emp))
      );

      setEditingEmployeeId(null);
      setFormData({});
    } catch (err) {
      setError("Failed to update employee. Please check the inputs.");
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/employee/${id}/`, {
        headers: { Authorization: `Token ${auth.token}` },
      });
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (err) {
      setError("Failed to delete employee.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="employee-list-container">
      <h1>Employee Management</h1>
      <ul className="employee-list">
        {employees.map((employee) => (
          <li key={employee.id} className="employee-item">
            <div className="employee-item-content">
              <h3>{employee.username}</h3>
              <p>
                {employee.first_name} {employee.last_name}
              </p>
              <p>{employee.email}</p>
              <div className="employee-actions">
                <button
                  onClick={() => handleEditClick(employee)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="delete-button"
                >
                  Delete
                </button>
                {editingEmployeeId === employee.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveClick(employee.id);
                    }}
                    className="edit-employee-form"
                  >
                    <div className="form-group">
                      <label htmlFor="edit-username">Username</label>
                      <input
                        type="text"
                        id="edit-username"
                        name="username"
                        value={formData.username || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-first-name">First Name</label>
                      <input
                        type="text"
                        id="edit-first-name"
                        name="first_name"
                        value={formData.first_name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-last-name">Last Name</label>
                      <input
                        type="text"
                        id="edit-last-name"
                        name="last_name"
                        value={formData.last_name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-email">Email</label>
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-new-password">
                        New Password (optional)
                      </label>
                      <input
                        type="password"
                        id="edit-new-password"
                        name="new_password"
                        placeholder="Enter new password (optional)"
                        value={formData.new_password || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            new_password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button type="submit" className="save-button">
                      Save
                    </button>
                  </form>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;
