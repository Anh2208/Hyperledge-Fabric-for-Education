import React from 'react';
import { Navigate } from 'react-router-dom';

const Protected = ({ user, role, children }) => {
    if (user == '' || (role !== 'Teacher' && role !== 'Student')) {
        return <Navigate to="/login" replace />;
    }
    if (user != role && role == 'Teacher') {
        return <Navigate to="/student" replace />;
    }
    if (user != role && role == 'Student') {
        return <Navigate to="/teacher" replace />;
    }

    return children;
};

export default Protected;
