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

const AddAdmin = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState({
        ms: "",
        email: "",
        name: "",
        phone: "",
        date: "",
        password: ""
    });

    const [phoneError, setPhoneError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === "phone") {
            const phoneRegex = /^((\+84)|0)(9[0-9]|1[2-9])+([0-9]{7})$/g;
            if (!phoneRegex.test(value)) {
                // Nếu người dùng nhập số điện thoại không đúng cú pháp thì reset giá trị ô input
                setUser((prev) => ({ ...prev, [id]: "" }));

                setPhoneError(true);
                return;
            }
        }
        setPhoneError(false);
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
            const response = await axiosInstance.post(`${BASE_URL}auth/registerAdmin/`, {
                adminMS: user.ms,
                email: user.email,
                name: user.name,
                sdt: user.phone,
                date: user.date,
                password: user.password
            });
            console.log("This is response: ", response);
            // Hiển thị toast khi tạo người dùng thành công
            toast.success('Tạo người dùng thành công');

        } catch (err) {
            // alert(err.message);
            // Hiển thị toast khi tạo người dùng thất bại
            // toast.error('Tạo người dùng thất bại');
            setUser({
                ms: "",
                email: "",
                name: "",
                phone: "",
                date: "",
                password: ""
            });
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
                <h5>Tạo người dùng</h5>
                <Form className="user__info-form" onSubmit={handleClick}>
                    <FormGroup className="flex w-full align-items-center mb-4">
                        <div className="input-container w-full">
                            <label htmlFor="ms">Mã số</label>
                            <input
                                type="text"
                                placeholder="Mã số Admin"
                                id="ms"
                                value={user.ms}
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
                                placeholder="Tên Admin"
                                id="name"
                                value={user.name}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-container w-full">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="number"
                                placeholder="Số điện thoại"
                                id="phone"
                                required
                                onChange={handleChange}
                            />
                            {phoneError && <div className="error phone">(*)Số điện thoại không hợp lệ</div>}
                        </div>
                    </FormGroup>
                    <FormGroup className="flex align-items-center mb-4">
                        <div className="input-container">
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
                            Tạo người dùng
                        </Button>
                    ) : (
                        <LoadingSpinner />
                    )}
                </div>
            </div>
        </>
    )
}

export default AddAdmin