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
const AddStudent = () => {

    const [user, setUser] = useState({
        email: "",
        mssv: "",
        class: "",
        name: "",
        sdt: "",
        date: "",
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
            const response = await axiosInstance.post(`${BASE_URL}auth/registerStudent`, {
                // mssv: user.mssv,
                // email: user.email,
                // name: user.name,
                // sex: user.sex,
                // password: user.password
                email: user.email,
                mssv: user.mssv,
                class: user.class,
                name: user.name,
                sdt: user.sdt,
                date: user.date,
                sex: user.sex,
                password: user.password
            });
            console.log("This is response: ", response);
            // Hiển thị toast khi tạo người dùng thành công
            toast.success('Tạo người dùng thành công');
            setUser({
                email: "",
                mssv: "",
                class: "",
                name: "",
                sdt: "",
                date: "",
                sex: "Nam",
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
                <h1 className='text-[25px] justify-center flex mb-5'>Đăng ký Sinh Viên</h1>
                <Form className="user__info-form" onSubmit={handleClick}>
                    <FormGroup className="flex w-full align-items-center mb-4">
                        <div className="input-container w-full">
                            <label htmlFor="mssv">Mã số</label>
                            <input
                                type="text"
                                placeholder="Mã số Sinh Viên"
                                id="mssv"
                                value={user.mssv}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-container w-full">
                            <label htmlFor="class">Mã lớp</label>
                            <input
                                type="class"
                                placeholder="Mã lớp"
                                value={user.class}
                                id="class"
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
                                placeholder="Tên Sinh Viên"
                                id="name"
                                value={user.name}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-container w-full">
                            <label htmlFor="sex">Giới tính</label><br />
                            <select
                                id="sex"
                                required
                                value={user.sex}
                                onChange={handleChange}
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div className="input-container w-full">
                            <label htmlFor="date">Ngày sinh</label>
                            <input
                                type="date"
                                id="date"
                                value={user.date}
                                required
                                onChange={handleChange}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup className="flex align-items-center mb-4">
                        <div className="input-container">
                            <label htmlFor="sdt">Số điện thoại</label>
                            <input
                                type="number"
                                placeholder="Số điện thoại"
                                id="sdt"
                                value={user.sdt}
                                required
                                onChange={handleChange}
                            />
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

export default AddStudent