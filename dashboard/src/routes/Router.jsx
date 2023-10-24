import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/Home'
import Sidebar from '../components/sidebar/SideBar'
import UserComponent from '../pages/User/UserComponent'
import AddUser from '../pages/User/AddUser'
import CourseComponent from '../pages/Course/CourseComponent'
import SubjectComponent from '../pages/Subject/SubjectComponent'
import AddSubject from '../pages/Subject/AddSubject'
import EditSubject from '../pages/Subject/EditSubject'
import AddCourse from '../pages/Course/AddCourse'
import CourseUpdate from '../pages/Course/CourseUpdate'
import ResultComponent from '../pages/Result/ResultComponent'
import CourseDetail from '../pages/Course/CourseDetail'
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
                    <Route path='/course' element={<CourseComponent />} />
                    <Route path='/course/add' element={<AddCourse />} />
                    <Route path='/course/detail/:id' element={<CourseDetail />} />
                    <Route path='/course/update/:id' element={<CourseUpdate />} />
                    <Route path='/subject' element={<SubjectComponent />} />
                    <Route path='/subject/add' element={<AddSubject />} />
                    <Route path='/subject/edit/:id' element={<EditSubject />} />
                    <Route path='/result' element={<ResultComponent />} />
                </Routes>
            </div>
        </div>
    )
}

export default Router