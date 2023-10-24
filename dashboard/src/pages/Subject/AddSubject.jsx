import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { Form, FormGroup, Button } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../../utils/config';
import LoadingSpinner from '../../hooks/LoadingSpinner';
import "./subject.css"
const AddSubject = () => {

    const [subject, setSubject] = useState({
        subjectMa: "",
        subjectTen: "",
        subjectSotc: ""
    })
    const [isRegistering, setIsRegistering] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setSubject((prev) => ({ ...prev, [id]: value }));
    }

    const handleClick = async (e) => {
        e.preventDefault();
        setIsRegistering(true); // Bắt đầu quá trình đăng ký

        // Kiểm tra nếu số tín chỉ không hợp lệ
        if (subject.subjectSotc <= 0 || subject.subjectSotc > 4) {
            toast.error('Số tín chỉ phải lớn hơn 0 và nhỏ hơn hoặc bằng 4', {
                autoClose: 2000,
                style: {
                    backgroundColor: 'red',
                },
            });
            setIsRegistering(false);
            return;
        }
        try {
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.post(`${BASE_URL}subject`, {
                subjectMa: subject.subjectMa,
                subjectTen: subject.subjectTen,
                subjectSotc: subject.subjectSotc,
            });
            console.log("This is response: ", response);
            // Hiển thị toast khi tạo người dùng thành công
            toast.success('Tạo học phần thành công');
            setSubject({
                subjectMa: "",
                subjectTen: "",
                subjectSotc: ""
            });

        } catch (err) {
            // if(err.response.data){
            //     console.log(err.response.data.message);

            // }
            toast.error(err.response.data.message, {
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
            <section className="content-main">
                <div className="content-header">
                    <h2 className="content-title">Thêm học phần</h2>
                    <div>
                        <Link to={"/subject"} className='btn btn-primary'>
                            <i className='material-icons md-plus'></i>Trở về 
                        </Link>
                    </div>
                </div>
                <div className='user__form'>
                    <Form>
                        <FormGroup className="flex w-full align-items-center mb-4">
                            <div className="input-container w-full">
                                <label htmlFor="subjectMa">Mã số học phần</label>
                                <input
                                    type="text"
                                    id="subjectMa"
                                    placeholder='Mã học phần'
                                    value={subject.subjectMa}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="subjectTen">Tên học phần</label>
                                <input
                                    type="text"
                                    id="subjectTen"
                                    placeholder='Tên học phần'
                                    value={subject.subjectTen}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            {/* <div className="input-container w-full">
                                <label htmlFor="subjectSotc">Số tín chỉ</label>
                                <input
                                    type="number"
                                    id="subjectSotc"
                                    // value={user.ms}
                                    required
                                // onChange={handleChange}
                                />
                            </div> */}
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                            <div className="input-container">
                                <label htmlFor="subjectSotc">Số tín chỉ</label>
                                <input
                                    type="number"
                                    id="subjectSotc"
                                    value={subject.subjectSotc}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </FormGroup>
                    </Form>
                    <div>
                        {!isRegistering ? (
                            <Button type='submit' className="btn primary__btn w-100 mt-4" onClick={handleClick} disabled={isRegistering}>
                                Tạo học phần
                            </Button>
                        ) : (
                            <LoadingSpinner />
                        )}
                    </div>
                </div>
            </section>

        </>
    )
}

export default AddSubject