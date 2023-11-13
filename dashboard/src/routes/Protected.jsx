import React from 'react';
import { Navigate } from 'react-router-dom';

const Protected = ({ user, role, children }) => {
    if (user == '' || role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    if (user != role && role == 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default Protected;
