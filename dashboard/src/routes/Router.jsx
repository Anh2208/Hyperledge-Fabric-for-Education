import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/Home'
import Sidebar from '../components/sidebar/SideBar'
import UserComponent from '../pages/User/UserComponent'
import AddUser from '../pages/User/AddUser'

const Router = () => {
    return (
        <div className='flex'>
            <aside className='max-w-[64px] xl:w-full xl:max-w-[280px]'>
                <Sidebar />
            </aside>
            <div className='flex-1 overflow-auto'>
                <Routes>
                    <Route path='/' element={<Navigate to="/home" />} />
                    <Route path='/home' element={<Home />} />
                    <Route path='/home' element={<Home />} />
                    <Route path='/user' element={<UserComponent />} />
                    <Route path='/user/adduser' element={<AddUser />} />

                </Routes>
            </div>
        </div>
    )
}

export default Router