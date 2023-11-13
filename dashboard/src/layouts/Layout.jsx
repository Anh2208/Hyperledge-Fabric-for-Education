import React from 'react'
import Router from '../routes/Router'
import Header from "../components/Header/Header"

const Layout = () => {
  return (
    <>
      {/* <Header /> */}
      <main>
        <Router />
      </main>
    </>
  )
}

export default Layout