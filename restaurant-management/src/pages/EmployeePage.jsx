import React, { useState ,useEffect} from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import { useAuth } from "../hooks/useAuth";
import Menu from "../components/Menu/Menu"; // Import Menu
import { useNavigate } from 'react-router-dom';

const ManagerPage = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

        useEffect(() => {
        if (!auth || auth.role !== 'employee') {
            navigate(auth ? "/" : "/login");

        }
    }, [auth, navigate]);
    const [menuOptions, setMenuOptions] = useState([
        { label: "Pending orders", path: "/employee/pending-order" },
        { label: "Completed order", path: "/employee/completed-order" },
        { label: "Log Out", path: "/logout" },
    ]);

    return (
        <div className="manager-page">
          {auth && auth.role !== "employee" && (
            <div className="error-message">
              <p>Access Denied: You do not have permission to view this page.</p>
            </div>
          )}
          <Menu options={menuOptions} username={auth.user } />
          <div className="content">
            {auth && auth.role === "employee" ? <Outlet /> : null}
          </div>
        </div>
      );
    };
    
    export default ManagerPage;

