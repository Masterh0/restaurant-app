import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/api';

function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Manage Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} - {user.email} - {user.is_admin ? "Admin" : "Employee"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement;