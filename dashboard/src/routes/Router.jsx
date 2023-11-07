import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/Home'
// import Login from '../pages/Login' // Thêm import cho trang Login
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
import DegreeComponent from "../pages/Degree/DegreeComponent"
import StudentResult from '../pages/Student/StudentResult'
import ResultExport from '../pages/Result/ResultExport'
import DetailResult from '../pages/Student/DetailResult'
import Semester from '../pages/Student/Semester'
import PrintResult from '../pages/Student/PrintResult'
import CheckResult from '../pages/Student/CheckResult'
import Login from '../pages/Login'
import DegreeCreate from '../pages/Degree/DegreeCreate'
import DegreeVerify from '../pages/Degree/DegreeVerify'
import DegreeResult from '../pages/Degree/DegreeResult'
import DegreeUpdate from '../pages/Degree/DegreeUpdate'

const Router = () => {
    return (
        <div className='flex container'>
            {/* <aside className='max-w-[64px] xl:w-full xl:max-w-[280px]'>
                <Sidebar />
            </aside> */}
            <div className='flex-1 overflow-auto'>
                <Routes>
                    <Route path='/' element={<Navigate to="/home" />} />
                    <Route path='/home' element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    {/* <Route path='/login' element={<Login />} /> */}
                    <Route
                        path='/*'
                        element={ // Sử dụng element và Routes bên trong Route để chỉ thêm Sidebar cho các trang con sau đó
                            <div className='flex'>
                                <aside className='sm:w-full max-w-[64px] md:max-w-[280px]'>
                                    <Sidebar />
                                </aside>
                                <div className='flex-1 overflow-auto'>
                                    <Routes>
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
                                        <Route path='/result/export/:id' element={<ResultExport />} />
                                        <Route path='/student' element={<StudentResult />} />
                                        <Route path='/student/result/:id' element={<DetailResult />} />
                                        <Route path='/student/result/check' element={<CheckResult />} />
                                        <Route path='/student/semester/:id' element={<Semester />} />
                                        <Route path='/student/semester/print/:id' element={<PrintResult />} />
                                        <Route path='/degree' element={<DegreeComponent />} />
                                        <Route path='/degree/create' element={<DegreeCreate />} />
                                        <Route path='/degree/update' element={<DegreeUpdate />} />
                                        <Route path='/degree/result' element={<DegreeResult />} />
                                        <Route path='/degree/create/verify' element={<DegreeVerify />} />
                                    </Routes>
                                </div>
                            </div>
                        }
                    />
                </Routes>
            </div>
        </div>
    )
}

export default Router
