import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleProtectedRoute = ({ requiredRole }) => {
    const { auth, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // صبر کن تا localStorage خونده بشه
    }

    if (!auth?.token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && auth.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
