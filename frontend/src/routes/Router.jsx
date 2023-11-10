import React, { useState, useContext, useEffect } from "react";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx"

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import TeacherHome from "../pages/Teacher/TeacherHome.jsx";
import TeacherScore from "../pages/Teacher/TeacherScore.jsx";
import StudentHome from "../pages/Student/StudentHome.jsx";
import StudentResult from "../pages/Student/StudentResult.jsx";
import TeacherExport from "../pages/Teacher/TeacherExport.jsx";
import Protected from './Protected'
import NotFound from "../pages/NotFound.jsx"
import Header from "../components/Header/Header.jsx";
import "../App.css"
import StudentDegree from "../pages/Student/StudentDegree.jsx";
import StudentDetails from "../pages/Student/StudentDetails.jsx";
import StudentExport from "../pages/Student/StudentExport.jsx";
const Router = () => {
  const { user } = useContext(AuthContext);
  // let isAuthenticated = false;
  // if (user) {
  //   isAuthenticated = true;
  // }
  // const PrivateWrapper = ({ children }) => {
  //   return isAuthenticated ? children : <Navigate to="/login" />;
  // };
  const HeaderLayout = () => (
    <>
      <Header />
      <Outlet />
    </>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<HeaderLayout />}>
        <Route index path="/" element={user && user.role == 'Teacher' ? <TeacherHome /> :
          user && user.role == 'Student' ? <StudentHome /> : <Login />} />
        {/* </Route> */}
        <Route
          path="/teacher"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Teacher">
              <TeacherHome />
            </Protected>
          } />
        <Route
          path="/teacher/score"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Teacher">
              <TeacherScore />
            </Protected>
          } />
        <Route
          path="/teacher/score/export/:id"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Teacher">
              <TeacherExport />
            </Protected>
          } />
        <Route
          path="/student"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Student">
              <StudentHome />
            </Protected>
          } />
        <Route
          path="/student/result"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Student">
              <StudentResult />
            </Protected>
          } />
        <Route
          path="/student/degree"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Student">
              <StudentDegree />
            </Protected>
          } />
        <Route
          path="/student/result/detail"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Student">
              <StudentDetails />
            </Protected>
          } />
        <Route
          path="/student/result/detail/export"
          element={
            <Protected user={user && user.role ? user.role : ''} role="Student">
              <StudentExport />
            </Protected>
          } />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

};

export default Router;
