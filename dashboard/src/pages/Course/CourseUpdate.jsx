import React, { useState, useEffect } from 'react';
import axios from "axios";
import useAxios from '../../hooks/useAxios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import { useParams } from 'react-router-dom';
import { Form, FormGroup, Button } from 'reactstrap';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';

const CourseUpdate = () => {
    const { id } = useParams();
    const [isRegistering, setIsRegistering] = useState(false);
    const {
        data: courses,
        loading,
        error,
    } = useAxios(`${BASE_URL}group/${id}`);
    const [course, setCourse] = useState({
        groupMa: "",
        subjectMa: "",
        groupTen: "",
        msgv: "",
        namegv: "",
        slot: "",
        currentslot: "",
        semester: "",
        access: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCourse((prev) => ({ ...prev, [id]: value }));
    };
    const formatDateToISO = (date) => {
        const formattedDate = new Date(date);
        if (!isNaN(formattedDate.getDate())) {
            return formattedDate.toISOString().split('T')[0];
        }
        return "";
    };
    useEffect(() => {
        console.log("courses is :", courses.groupTen);
        console.log("courses is :", courses.namegv);
        console.log("courses is :", courses.currentslot);

        if (courses && !loading && !error && courses.groupMa && courses.subjectMa &&
            courses.slot && courses.semester && courses.access && courses.groupTen) {
            setCourse({
                groupMa: courses.groupMa,
                subjectMa: courses.subjectMa,
                groupTen: courses.groupTen,
                msgv: courses.msgv,
                namegv: courses.namegv,
                slot: courses.slot,
                currentslot: courses.currentslot,
                semester: courses.semester,
                access: formatDateToISO(courses.access),
            });
        }
    }, [courses, loading, error]);

    const handleClick = async (e) => {
        e.preventDefault();
        setIsRegistering(true); // Bắt đầu quá trình đăng ký

        // Kiểm tra nếu số tín chỉ không hợp lệ
        if (course.slot <= 0 || course.slot > 100) {
            toast.error('Số lượng phải lớn hơn 0 và nhỏ hơn hoặc bằng 100', {
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
            console.log("This is courses update: ", course);
            const response = await axiosInstance.put(`${BASE_URL}group/${id}`, {
                groupMa: course.groupMa,
                subjectMa: course.subjectMa,
                groupTen: course.groupTen,
                msgv: course.msgv,
                namegv: course.namegv,
                slot: course.slot,
                currentslot: course.currentslot,
                semester: course.semester,
                access: (course.access),
            });
            // Hiển thị toast khi tạo người dùng thành công
            toast.success('Cập nhật học phần thành công', {
                onClose: () => {
                    setTimeout(() => {
                        window.location.reload(); // Reload trang sau khi Toast đã đóng
                    }, 2000); // Đợi 1 giây trước khi reload trang
                },
            });

        } catch (err) {
            toast.error(err.response.data.message, {
                autoClose: 2000,
                style: {
                    backgroundColor: 'red'
                },
                onClose: () => {
                    setTimeout(() => {
                        window.location.reload(); // Reload trang sau khi Toast đã đóng
                    }, 2000); // Đợi 1 giây trước khi reload trang
                },
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
                    <h2 className="content-title">Chi tiết lớp học phần</h2>
                    <div>
                        <Link to="/course" className="btn btn-primary">
                            <i className="material-icons md-plus"></i>Trở về
                        </Link>
                    </div>
                </div>
                <div className="user__form">
                    <Form>
                        <FormGroup className="flex w-full align-items-center mb-4">
                            <div className="input-container w-full">
                                <label htmlFor="groupMa">Mã lớp học phần</label>
                                <input
                                    type="text"
                                    id="groupMa"
                                    placeholder="Mã học phần"
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
                                    placeholder="Tên lớp học phần"
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
                                    placeholder="Tên học phần"
                                    value={course.subjectMa}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                            <div className="input-container w-full">
                                <label htmlFor="msgv">Mã giảng viên</label>
                                <input
                                    type="text"
                                    id="msgv"
                                    placeholder="Mã cán bộ giảng dạy"
                                    value={course.msgv}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="namegv">Tên giảng viên</label>
                                <input
                                    type="text"
                                    id="namegv"
                                    value={course.namegv || ""}
                                    required
                                    readOnly
                                />
                            </div>
                            <div className="input-container w-full">
                            </div>
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                            <div className="input-container w-full">
                                <label htmlFor="semester">Học kỳ</label>
                                <input
                                    type="number"
                                    id="semester"
                                    placeholder="Học kỳ"
                                    value={course.semester}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="slot">Số học viên</label>
                                <input
                                    type="number"
                                    id="slot"
                                    placeholder="Số lượng sinh viên"
                                    value={course.slot}
                                    required
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="currentslot">Sinh viên đă đăng ký</label>
                                <input
                                    type="number"
                                    id="currentslot"
                                    placeholder="Số lượng sinh viên"
                                    value={course.currentslot || "0"}
                                    readOnly
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
                                Cập nhật
                            </Button>
                        ) : (
                            <LoadingSpinner />
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default CourseUpdate;
