import React from "react";
import Header from "../Header/Header";
import Router from "../../routes/Router";

const Layout = () => {
  return (
    <>
      {/* <Header /> */}
      {/* sidebar */}
      <main>
        <Router />
      </main>
    </>
  );
};

export default Layout;
