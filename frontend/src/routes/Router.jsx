import React, { useState, useContext, useEffect } from "react";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx"

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
// import "../App.css"
const Router = () => {
  const { user } = useContext(AuthContext);
  let isAuthenticated = false;
  if (user) {
    isAuthenticated = true;
  }
  const PrivateWrapper = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  console.log("hdashda", user)
  return (
    // <Routes>
    //   {/* Các đường dẫn không cần xác thực */}
    //   <Route path="/register" element={<Signup />} />
    //   <Route path="/service" element={<Services />} />
    //   <Route path="/login" element={<Login />} />
    //   <Route path="/" element={<Home />} />
    // </Routes>
    // <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateWrapper>...</PrivateWrapper>}>
      {/* <Route> */}
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/home" element={<Home />} />


    </Routes>
    // </Router>
  );
};

export default Router;
