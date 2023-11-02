import React from "react";
import { useNavigate, Route } from "react-router-dom";

function PrivateRouter({ component: Component, isAuthenticated, userRole, ...rest }) {
  return (
    <Route
      {...rest}
      element={(props) => {
        if (isAuthenticated && userRole == isAuthenticated) {
          return <Component {...props} />;
        } else {
          return <useNavigate to="/login" />;
        }
      }}
    />
  );
}

export default PrivateRouter;
