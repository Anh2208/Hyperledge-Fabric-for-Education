import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import biểu tượng
import { Form, FormGroup, Button } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../user.css"
import { BASE_URL } from '../../../utils/config';
import LoadingSpinner from '../../../hooks/LoadingSpinner';

const AddTeacher = () => {

    const [user, setUser] = useState({
        msgv: "",
        email: "",
        name: "",
        sex: "male",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setUser((prev) => ({ ...prev, [id]: value }));
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setIsRegistering(true); // Bắt đầu quá trình đăng ký
        // console.log(user);
        try {
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.post(`${BASE_URL}auth/registerTeacher/`, {
                msgv: user.msgv,
                email: user.email,
                name: user.name,
                sex: user.sex,
                password: user.password
            });
            console.log("This is response: ", response);
            // Hiển thị toast khi tạo người dùng thành công
            toast.success('Tạo người dùng thành công');
            setUser({
                msgv: "",
                email: "",
                name: "",
                sex: "male",
                password: ""
            });

        } catch (err) {
            // alert(err.message);
            // Hiển thị toast khi tạo người dùng thất bại
            // toast.error('Tạo người dùng thất bại');
            toast.error('Tạo người dùng thất bại', {
                autoClose: 2000,
                style: {
                    backgroundColor: 'red'
                }
            });
        } finally {
            setIsRegistering(false); // Kết thúc quá trình đăng ký
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="user__form">
                <h1 className='text-[25px] justify-center flex mb-5'>Đăng ký Giảng Viên</h1>
                <Form className="user__info-form" onSubmit={handleClick}>
                    <FormGroup className="flex w-full align-items-center mb-4">
                        <div className="input-container w-full">
                            <label htmlFor="msgv">Mã số</label>
                            <input
                                type="text"
                                placeholder="Mã số Giảng viên"
                                id="msgv"
                                value={user.msgv}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-container w-full">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={user.email}
                                id="email"
                                required
                                onChange={handleChange}
                            />
                        </div>
                    </FormGroup>

                    <FormGroup className="flex w-full align-items-center mb-4">
                        <div className="input-container w-full">
                            <label htmlFor="name">Tên</label>
                            <input
                                type="text"
                                placeholder="Tên Giảng viên"
                                id="name"
                                value={user.name}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-container w-full">
                            <label htmlFor="sex">Giới tính</label><br/>
                            <select
                                id="sex"
                                required
                                value={user.sex}
                                onChange={handleChange}
                            >
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                            </select>
                        </div>
                    </FormGroup>
                    <FormGroup className="flex align-items-center mb-4">
                        <div className="input-container">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-input flex">
                                <input
                                    type={showPassword ? 'text' : 'password'} // Hiển thị mật khẩu hoặc ẩn mật khẩu
                                    id="password"
                                    required
                                    value={user.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </FormGroup>
                </Form>
                <div>
                    {!isRegistering ? (
                        <Button type='submit' className="btn primary__btn w-100 mt-4" onClick={handleClick} disabled={isRegistering}>
                            Đăng ký
                        </Button>
                    ) : (
                        <LoadingSpinner />
                    )}
                </div>
            </div>
        </>
    )
}

export default AddTeacher