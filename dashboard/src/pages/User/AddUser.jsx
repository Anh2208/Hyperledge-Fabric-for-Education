import React, { useState } from 'react';
import axios from "axios";
import { Link } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { Form, FormGroup, Button, ButtonGroup } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './user.css';
import { BASE_URL } from "../../utils/config";
import LoadingSpinner from "../../hooks/LoadingSpinner"
import AddAdmin from './addUser/AddAdmin';
import AddTeacher from './addUser/AddTeacher';
import AddStudent from './addUser/AddStudent';

const AddUser = () => {

    const [selectedRole, setSelectedRole] = useState("admin"); // Sử dụng state để theo dõi vai trò đã chọn
    const handleRoleSelection = (role) => {
        setSelectedRole(role); // Cập nhật trạng thái state khi người dùng chọn vai trò
    }
    const getRoleComponent = () => {
        if (selectedRole === "admin") {
            return <AddAdmin />;
        } else if (selectedRole === "teacher") {
            return <AddTeacher />;
        } else if (selectedRole === "student") {
            return <AddStudent />;
        }
    }
    return (
        <>
            <section className="content-main">
                <div className="content-header mb-0">
                    {/* <h2 className="content-title">Thêm người dùng</h2> */}
                    <div className='rounded-md border-2 border-black'>
                        <Link to={"/user"} className="flex justify-between">
                            <span className='items-center rounded-md px-1 py-2'>
                                <FaArrowRotateLeft />
                            </span>
                            <span className='hidden text-base font-semibold xl:block p-1'>
                                Quay lại
                            </span>
                        </Link>
                    </div>
                    <ButtonGroup className='b top-0 m-0'>
                        <Button
                            className={`custom-button ${selectedRole === "admin" ? "active" : ""} className='b top-0 m-0'`}
                            color="danger"
                            onClick={() => handleRoleSelection("admin")}
                        >
                            Admin
                        </Button>
                        <Button
                            className={`custom-button ${selectedRole === "teacher" ? "active" : ""}`}
                            color="warning"
                            onClick={() => handleRoleSelection("teacher")}
                        >
                            Giảng viên
                        </Button>
                        <Button
                            className={`custom-button ${selectedRole === "student" ? "active" : ""}`}
                            color="success"
                            onClick={() => handleRoleSelection("student")}
                        >
                            Sinh Viên
                        </Button>
                    </ButtonGroup>
                </div>

                {getRoleComponent()}
            </section>
        </>
    );
};

export default AddUser;
