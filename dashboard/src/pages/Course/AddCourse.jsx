import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { Form, FormGroup, Button } from 'reactstrap';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';

const AddCourse = () => {

    const [course, setCourse] = useState({
        groupMa: "",
        groupTen: "",
        subjectMa: "",
        msgv: "",
        slot: "",
        semester: "",
        access: "",
    });
    const [isRegistering, setIsRegistering] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCourse((prev) => ({ ...prev, [id]: value }));
    }

    const handleClick = async (e) => {
        e.preventDefault();

        // Kiểm tra xem tất cả các trường đã được nhập hay chưa
        if (
            course.groupMa &&
            course.groupTen &&
            course.subjectMa &&
            course.slot &&
            course.semester &&
            course.access
        ) {
            setIsRegistering(true); // Bắt đầu quá trình đăng ký

            console.log("Course is:", course);

            try {
                const axiosInstance = axios.create({
                    withCredentials: true
                });
                console.log("This is response: ", course);
                const response = await axiosInstance.post(`${BASE_URL}group`, {
                    groupMa: course.groupMa,
                    groupTen: course.groupTen,
                    subjectMa: course.subjectMa,
                    msgv: course.msgv,
                    slot: course.slot,
                    semester: course.semester,
                    access: course.access,
                });
                // Hiển thị toast khi tạo học phần thành công
                toast.success('Tạo học phần thành công');
                setCourse({
                    groupMa: "",
                    groupTen: "",
                    subjectMa: "",
                    msgv: "",
                    slot: "",
                    semester: "",
                    access: "",
                });
            } catch (err) {
                if (err) {
                    toast.error(err.response.data.message, {
                        autoClose: 2000,
                        style: {
                            backgroundColor: 'red'
                        }
                    });
                }
            } finally {
                setIsRegistering(false); // Kết thúc quá trình đăng ký
            }
        } else {
            // Nếu không có trường nào bị bỏ trống, bạn có thể hiển thị thông báo hoặc thực hiện xử lý khác ở đây.
            toast.error('Vui lòng điền đầy đủ thông tin');
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
                        <Link to={"/course"} className='btn btn-primary'>
                            <i className='material-icons md-plus'></i>Trở về
                        </Link>
                    </div>
                </div>
                <div className='user__form'>
                    <Form>
                        <FormGroup className="flex w-full align-items-center mb-4">
                            <div className="input-container w-full">
                                <label htmlFor="groupMa">Mã lớp học phần</label>
                                <input
                                    type="text"
                                    id="groupMa"
                                    placeholder='Mã học phần'
                                    value={course.groupMa}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="groupTen">Tên lớp học phần</label>
                                <input
                                    type="text"
                                    id="groupTen"
                                    placeholder='Lớp lớp học phần'
                                    value={course.groupTen}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="subjectMa">Mã học phần</label>
                                <input
                                    type="text"
                                    id="subjectMa"
                                    placeholder='Tên học phần'
                                    value={course.subjectMa}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                            <div className="input-container">
                                <label htmlFor="msgv">Mã giảng viên</label>
                                <input
                                    type="text"
                                    id="msgv"
                                    placeholder='Mã cán bộ giảng dạy'
                                    value={course.msgv}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="semester">Học kỳ</label>
                                <input
                                    type="number"
                                    id="semester"
                                    placeholder='Học kỳ'
                                    value={course.semester}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                            <div className="input-container">
                                <label htmlFor="slot">Số học viên</label>
                                <input
                                    type="number"
                                    id="slot"
                                    placeholder='Số lượng sinh viên'
                                    value={course.slot}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                            <div className="input-container">
                                <label htmlFor="access">Ngày khóa điểm</label>
                                <input
                                    type="date"
                                    id="access"
                                    value={course.access}
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

export default AddCourse