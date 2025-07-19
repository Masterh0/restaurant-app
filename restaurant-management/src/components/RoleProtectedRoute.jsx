import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleProtectedRoute = ({ requiredRole }) => {
    const { auth } = useAuth();

    if (!auth.token) {
        return <Navigate to="/login" />;
    }

    if (auth.role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
