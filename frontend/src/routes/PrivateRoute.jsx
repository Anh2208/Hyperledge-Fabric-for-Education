import React from "react";
import { Redirect, Route } from "react-router-dom";

function PrivateRouter({ component: Component, isAuthenticated, userRole, ...rest }) {
  return (
    <Route
      {...rest}
      element={(props) => {
        if (isAuthenticated && userRole === "admin") {
          return <Component {...props} />;
        } else {
          return <Redirect to="/login" />;
        }
      }}
    />
  );
}

export default PrivateRouter;
