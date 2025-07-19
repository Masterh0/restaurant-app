import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Logout = () => {
  const { logout } = useAuth(); // Use logout function from useAuth
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logout(); // Perform logout
      navigate("/"); // Redirect to home page after logout
    };

    handleLogout();
  }, [logout, navigate]); // Dependencies: useEffect runs when logout or navigate change

  return null; // This component doesn't need to render anything
};

export default Logout;
