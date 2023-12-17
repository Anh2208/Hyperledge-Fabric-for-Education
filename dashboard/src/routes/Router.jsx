import React, { useContext } from 'react'
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
import VerifyListComponent from '../pages/VerifyList/VerifyListComponent'
import VerifyListManage from '../pages/VerifyList/VerifyListManage'
import NotFound from "../pages/NotFound.jsx"
import Protected from './Protected'
import { AuthContext } from '../context/AuthContext'
import Header from '../components/Header/Header'
import EditScore from '../pages/Student/EditScore.jsx'

const Layout = ({ children }) => {
    return (
        <>
            <main>
                <Header />
                <div className='flex flex-row'>
                    <aside className='w-[280px]'>
                        <Sidebar />
                    </aside>
                    <div className='w-full'>
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
};

const Router = () => {

    const { user } = useContext(AuthContext);
    console.log(user)

    return (
        <>
            <div className='flex container'>
                {/* <aside className='max-w-[64px] xl:w-full xl:max-w-[280px]'>
                <Sidebar />
            </aside> */}
                <div className=''>
                    <Routes>
                        <Route path='/' element={<Navigate to="/home" />} />
                        {/* <Route path='/home' element={<Home />} /> */}
                        <Route path='/login' element={<Login />} />
                        <Route
                            path="/home"
                            element={
                                <>
                                    <Header></Header>
                                    <Protected user={user && user.role ? user.role : ''} role="admin">
                                        <Home />
                                    </Protected>
                                </>
                            } />

                        <Route
                            path='/*'
                            element={
                                <Layout>
                                    <Routes>
                                        {/* <div className='flex'>
                                        <aside className='sm:w-full max-w-[64px] md:max-w[280px]'>
                                            <Sidebar />
                                        </aside>
                                        <div className='flex-1 overflow-auto' > */}
                                        {/* <Routes> */}
                                        <Route
                                            path="/user"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <UserComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/user/adduser"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <AddUser />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/course"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <CourseComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/course/add"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <AddCourse />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/course/detail/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <CourseDetail />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/course/update/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <CourseUpdate />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/subject"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <SubjectComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/subject/add"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <AddSubject />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/subject/edit/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <EditSubject />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/result"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <ResultComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/result/export/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <ResultExport />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <StudentResult />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student/result/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DetailResult />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student/result/check"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <CheckResult />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student/result/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DetailResult />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student/semester/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <Semester />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student/semester/print/:id"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <PrintResult />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/student/editscore"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <EditScore />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/verify"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <VerifyListComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/verify/management"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <VerifyListManage />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/degree"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DegreeComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/degree"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DegreeComponent />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/degree/create"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DegreeCreate />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/degree/update"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DegreeUpdate />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/degree/result"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DegreeResult />
                                                </Protected>
                                            } />
                                        <Route
                                            path="/degree/create/verify"
                                            element={
                                                <Protected user={user && user.role ? user.role : ''} role="admin">
                                                    <DegreeVerify />
                                                </Protected>
                                            } />

                                        {/* </Routes> */}
                                        {/* </div>
                                    </div> */}
                                    </Routes>
                                </Layout>
                            }
                        >
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </div>
        </>
    )
}

export default Router

