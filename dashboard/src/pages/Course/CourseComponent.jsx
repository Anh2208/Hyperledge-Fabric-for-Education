import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import useAxios from '../../hooks/useAxios';
import { BASE_URL } from '../../utils/config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import './course.css'

const CourseComponent = () => {

    const [course, setCourses] = useState(`${BASE_URL}group/getGroup/getAll`);
    const { data: courses, loading, error } = useAxios(course);

    useEffect(() => {
        if (courses) {
            console.log("Dữ liệu học phần đã được tải:", courses);
        }
    }, [courses]);

    const deletehandler = (id, groupMa) => {
        try {
            // if (window.confirm("Bạn có thực sự muốn xóa lớp học phần???")) {
            if (window.confirm(`Bạn có thực sự muốn xóa lớp học phần ${groupMa}?`)) {
                const axiosInstance = axios.create({
                    withCredentials: true
                });
                const response = axiosInstance.delete(`${BASE_URL}group/${id}`);
                // toast.success('Xóa tour thành công');
                toast.success('Xóa lớp học phần thành công', {
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
            <section className='content-main'>
                <div className='content-header'>
                    <h2 className='content-title'>Lớp học phần</h2>
                    <div>
                        <Link to={"/course/add"} className='btn btn-primary'>
                            <i className='material-icons md-plus'></i>Thêm Lớp học phần
                        </Link>
                    </div>
                </div>
                <div className='card mb-4'>
                    <header className='card-header mb-8 justify-end flex'>
                        <div className='row gx-3 '>
                            <div className='col-lg-4 col-md-4 m-4 p-2 me-auto border border-black rounded-md'>
                                <input
                                    type="text"
                                    placeholder='Tìm kiếm học phần...'
                                    className='form-control'
                                />
                                {/* <button className=''><FaSearchengin /></button> */}
                            </div>
                        </div>
                    </header>

                    <div className='card-body'>
                        {loading && <h4 className="text-center pt-5">Loading.....</h4>}
                        {error && <h4 className="text-center pt-5">{error}</h4>}
                        {!loading && !error && (
                            <table size="sm" className='table-course border-separate border border-slate-400 '>
                                <thead>
                                    <tr className='text-center'>
                                        <th>STT</th>
                                        <th>Mã Lớp</th>
                                        <th className='max-w-[90px]'>Mã học phần</th>
                                        <th>Tên lớp</th>
                                        <th>Mã giảng viên</th>
                                        {/* <th className='text-left'>Tên giảng viên</th> */}
                                        <th className='centered-cell'>Số lượng</th>
                                        <th>Học kỳ</th>
                                        <th className='centered-cell min-w-[100px]'>Đăng ký</th>
                                        <th className='centered-cell' style={{ justifyContent: 'center', alignItems: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses?.map((course, index) => {
                                        return (
                                            <tr key={course._id || index} className='align-items-center'>
                                                <td>{index + 1}</td>
                                                <td>{course.groupMa}</td>
                                                <td>{course.subjectMa}</td>
                                                <td className='text-left'>{course.groupTen}</td>
                                                <td>{course.msgv}</td>
                                                {/* <td>{course.namegv}</td> */}
                                                {course.currentslot ? (
                                                    <td className='centered-cell'>
                                                        {course.currentslot}/{course.slot}
                                                    </td>
                                                ) : (
                                                    <td className='centered-cell'>
                                                        0/{course.slot}
                                                    </td>
                                                )}
                                                <td className='text-center'>{course.semester}</td>
                                                <td className='centered-cell'>
                                                    <button>
                                                        <Link
                                                            to={`/course/detail/${course._id}`}
                                                            className="rounded-full bg-blue-300 py-[3px] px-3 text-xs text-green-900 transition-all hover:bg-blue-100"
                                                        >
                                                            Đăng ký
                                                        </Link>
                                                    </button>
                                                </td>
                                                <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                    <button>
                                                        <Link
                                                            to={`/course/update/${course._id}`}
                                                            className="rounded-full bg-green-200 py-[3px] px-3 text-xs text-green-900 transition-all hover:bg-green-100"
                                                        >
                                                            Sửa
                                                        </Link>
                                                    </button>
                                                    <button
                                                        onClick={() => deletehandler(course._id, course.groupMa)}
                                                    >
                                                        <span className='className="ml-3 rounded-full bg-orange-200 py-[3px] px-3 text-xs text-orange-900 transition-all hover:bg-orange-100"'>
                                                            Xóa
                                                        </span>

                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>



            </section>
        </>
    )
}

export default CourseComponent