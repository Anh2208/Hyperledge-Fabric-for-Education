import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../utils/config';
import axios from "axios";
import useAxios from '../../hooks/useAxios';
import { Link } from 'react-router-dom'
import Table from "react-bootstrap/Table";
import { Form, FormGroup, Button } from 'reactstrap';
import LoadingSpinner from '../../hooks/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseDetail = () => {
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
    const [addStudent, setAddStudent] = useState({
        groupMa: "",
        subjectMS: "",
        studentMS: "",
        teacherMS: "",
        semester: "",
    });
    const handleChange = (e) => {
        const { id, value } = e.target;
        setAddStudent((prev) => ({ ...prev, [id]: value }));
    };
    useEffect(() => {
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
        setAddStudent({
            groupMa: courses.groupMa,
            subjectMS: courses.subjectMa,
            studentMS: "",
            teacherMS: courses.msgv,
            semester: courses.semester,
        })
    }, [courses]);

    const handleClick = async (e) => {
        e.preventDefault();
        // Kiểm tra xem tất cả các trường đã được nhập hay chưa
        if (
            addStudent.groupMa &&
            addStudent.subjectMS &&
            addStudent.studentMS &&
            addStudent.teacherMS &&
            addStudent.semester
        ) {
            setIsRegistering(true); // Bắt đầu quá trình đăng ký
            console.log("student is:", addStudent);

            try {
                const axiosInstance = axios.create({
                    withCredentials: true
                });
                console.log("This is response: ", addStudent);
                await axiosInstance.post(`${BASE_URL}result/${courses._id}`, {
                    groupMa: addStudent.groupMa,
                    subjectMS: addStudent.subjectMS,
                    studentMS: addStudent.studentMS,
                    teacherMS: addStudent.teacherMS,
                    semester: addStudent.semester,
                });
                toast.success('Đăng ký sinh viên vào lớp học phần thành công', {// Hiển thị toast khi tạo học phần thành công
                    onClose: () => {
                        setTimeout(() => {
                            window.location.reload(); // Reload trang sau khi Toast đã đóng
                        }, 2000); // Đợi 1 giây trước khi reload trang
                    },
                });
                setAddStudent({// Đặt lại giá trị khi đăng ký thành công
                    groupMa: courses.groupMa,
                    subjectMS: courses.subjectMa,
                    studentMS: "",
                    msgv: courses.msgv,
                    semester: courses.semester,
                })
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
            toast.error('Vui lòng điền đầy đủ thông tin');
        }
    }
    const deletehandler = (studentMS, groupMa) => {
        console.log("studentMS is", studentMS);
        console.log("groupMa is", groupMa);
        try {
            // if (window.confirm("Bạn có thực sự muốn xóa lớp học phần???")) {
            if (window.confirm(`Bạn có thực sự muốn xóa sinh viên ${studentMS}?`)) {
                const axiosInstance = axios.create({
                    withCredentials: true
                });
                const response = axiosInstance.delete(`${BASE_URL}result/deleteResult/mongodb/${courses._id}`, {
                    data: {
                        groupMa: groupMa,
                        studentMS: studentMS
                    }
                });
                // toast.success('Xóa tour thành công');
                toast.success('Xóa sinh viên khỏi lớp học phần thành công', {
                    onClose: () => {
                        setTimeout(() => {
                            window.location.reload(); // Reload trang sau khi Toast đã đóng
                        }, 2000); // Đợi 1 giây trước khi reload trang
                    },
                });
            }
        } catch (err) {
            toast.error(err, {
                autoClose: 2000,
                style: {
                    backgroundColor: 'red'
                }
            });
        }
    };
    const formatDateToISO = (date) => {
        const formattedDate = new Date(date);
        if (!isNaN(formattedDate.getDate())) {
            return formattedDate.toISOString().split('T')[0];
        }
        return "";
    };
    // phân trang
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const studentsPerPage = 8; // Số sinh viên trên mỗi trang

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = Array.isArray(courses.results) ? courses.results.slice(indexOfFirstStudent, indexOfLastStudent) : [];

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
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
                                    value={course.groupMa || ""}
                                    readOnly
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="groupTen">Tên lớp học phần</label>
                                <input
                                    type="text"
                                    id="groupTen"
                                    placeholder="Tên học phần"
                                    value={course.groupTen || ""}
                                    readOnly
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="subjectMa">Mã học phần</label>
                                <input
                                    type="text"
                                    id="subjectMa"
                                    placeholder="Tên học phần"
                                    value={course.subjectMa || ""}
                                    readOnly
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
                                    value={course.msgv || ""}
                                    readOnly
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="namegv">Tên giảng viên</label>
                                <input
                                    type="text"
                                    id="namegv"
                                    placeholder="Tên cán bộ giảng dạy"
                                    value={course.namegv || ""}
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
                                    value={course.semester || ""}
                                    readOnly
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="slot">Số sinh viên</label>
                                <input
                                    type="number"
                                    id="slot"
                                    placeholder="Số lượng sinh viên"
                                    value={course.slot || ""}
                                    readOnly
                                />
                            </div>
                            <div className="input-container w-full">
                                <label htmlFor="currentslot">Sinh viên đă đăng ký</label>
                                <input
                                    type="number"
                                    id="currentslot"
                                    placeholder="Số lượng sinh viên"
                                    value={course.currentslot || ""}
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
                                    value={course.access || ""}
                                    readOnly
                                />
                            </div>
                        </FormGroup>
                        <FormGroup className="flex align-items-center mb-4">
                        </FormGroup>
                    </Form>
                    <div className='mt-8 flex'>
                        <div className="user__form p-0">
                            <h1 className='text-[20px]'>Danh sách sinh viên</h1>
                            <div className='card-body'>
                                {Array.isArray(currentStudents) && currentStudents.length > 0 ? (
                                    <table size="sm" className='flex-1 table-result mr-5'>
                                        <thead>
                                            <tr className=''>
                                                <th>STT</th>
                                                <th className='min-w-[90px]'>MSSV</th>
                                                <th className='min-w-[150px] text-left'>Tên sinh viên</th>
                                                <th className='centered-cell' style={{ display: '', justifyContent: 'center', alignItems: 'center' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentStudents.map((result, index) => (
                                                <tr key={index} className='text-left'>
                                                    <td>{index + 1 + indexOfFirstStudent}</td>
                                                    <td className='text-center'>{result.studentMS}</td>
                                                    <td>{result.studentName}</td>
                                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <button
                                                            className="ml-3 rounded-full bg-orange-200 py-[3px] px-3 text-xs 
                                                                        text-orange-900 transition-all hover-bg-orange-100"
                                                            onClick={() => deletehandler(result.studentMS, courses.groupMa, result._id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>Lớp chưa có sinh viên</p>
                                )}
                                <div className="pagination">
                                    {Array.isArray(courses.results) && courses.results.length > 0 ? (
                                        Array.from({ length: Math.ceil(courses.results.length / studentsPerPage) }).map((_, index) => (
                                            <button key={index} onClick={() => paginate(index + 1)} className="pagination-button rounded-full">
                                                {index + 1}
                                            </button>
                                        ))
                                    ) : null}
                                </div>


                            </div>
                        </div>
                        <div>
                            {/* <h1>Đăng ký sinh viên vào lớp học phần</h1> */}
                            <div>
                                <input type="text" placeholder='Thêm sinh viên' id='studentMS' value={addStudent.studentMS} className='max-w-xs' onChange={handleChange} />
                                <div className='flex'>
                                    {!isRegistering ? (
                                        <Button className="btn primary__btn w-100 mt-4" onClick={handleClick}>
                                            Thêm sinh viên
                                        </Button>
                                    ) : (
                                        <LoadingSpinner />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default CourseDetail;
