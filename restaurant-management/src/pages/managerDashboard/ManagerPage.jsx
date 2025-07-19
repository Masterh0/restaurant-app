import React, { useState ,useEffect} from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import { useAuth } from "../../hooks/useAuth";
import Menu from "../../components/Menu/Menu"; // Import Menu
import { useNavigate } from 'react-router-dom';

const ManagerPage = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

        useEffect(() => {
        if (!auth || auth.role !== 'manager') {
            navigate(auth ? "/" : "/login");

        }
    }, [auth, navigate]);
    const [menuOptions, setMenuOptions] = useState([
        { label: "Add Food", path: "/manager/add-food" },
        { label: "Edit & Delete Food", path: "/manager/edit-food" },
        { label: "Add Employee", path: "/manager/add-employee" },
        { label: "Edit & Delete Employee", path: "/manager/edit-employee" },
        { label: "Add discount", path: "/manager/add-discount" },
        { label: "List discount", path: "/manager/discountes" },
        { label: "Most sold", path: "/manager/top-sold-dish" },
        { label: "Date range order", path: "/manager/date-range-order" },
        { label: "Log Out", path: "/logout" },
    ]);

    return (
        <div className="manager-page">
          {auth && auth.role !== "manager" && (
            <div className="error-message">
              <p>Access Denied: You do not have permission to view this page.</p>
            </div>
          )}
          <Menu options={menuOptions} username={auth.user } />
          <div className="content">
            {auth && auth.role === "manager" ? <Outlet /> : null}
          </div>
        </div>
      );
    };
    
    export default ManagerPage;

