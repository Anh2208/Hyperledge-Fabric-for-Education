import React, { useEffect, useState } from 'react';
import { useParams, Link, redirect } from 'react-router-dom'
import axios from 'axios';
import { FaArrowRotateLeft } from 'react-icons/fa6';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { BASE_URL } from '../../utils/config';
import useAxios from "../../hooks/useAxios";
import LoadingSpinner from '../../hooks/LoadingSpinner';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ReactToPrint from "react-to-print"; // Import ReactToPrint

const TeacherExport = () => {
    const { user } = useContext(AuthContext);
    console.log("user is ", user);
    const { id } = useParams();
    const [check, setCheck] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);// tạo trạng thái loading khi nhấn nút "Lưu"
    const [course, setCourse] = useState(`${BASE_URL}group/${id}`);
    const { data: couserTable, loading, error } = useAxios(course);
    const [courses, setCourses] = useState([couserTable.results]);
    const componentRef = React.useRef();
    const [hasPermissionError, setHasPermissionError] = useState(false);

    console.log("courses is ", courses);

    useEffect(() => {
        if (couserTable && couserTable.results) {
            setCourses([...couserTable.results]);
            console.log("courses is ", courses);
        }
        setCourse(`${BASE_URL}group/${id}`);
    }, [couserTable]);

    const handleClickCheck = async (e) => {
        setIsConfirm(true);
        let checkhasPermissionError = false;
        const hasResultWithoutScore = courses.some((result) => {
            return typeof result.score !== 'number' || isNaN(result.score);
        });

        if (hasResultWithoutScore) {
            // alert("Cần nhập tất cả điểm của sinh viên trước khi xác thực.");
            toast.error("Cần nhập tất cả điểm của sinh viên trước khi xác thực.", {
                autoClose: 3000,
                style: {
                    background: 'red',
                }
            });
            setIsConfirm(false); // Đặt lại trạng thái loading
        } else {
            try {
                const updatedCourses = await Promise.all(couserTable.results.map(async (result) => {
                    try {
                        const axiosInstance = axios.create({
                            withCredentials: true,
                        });

                        const response = await axiosInstance.post(`${BASE_URL}result/check/checkResult/${result._id}`);
                        const isConfirmed = response.data.result;

                        return { ...result, confirm: isConfirmed };
                    } catch (err) {
                        if (err.response.data.message === "Kết quả không tồn tại") {
                            setHasPermissionError(true);
                            checkhasPermissionError = true;
                        }
                        return ({ ...result, confirm: false });
                    }
                }));

                const isConfirmed = updatedCourses.every((result) => result.confirm);

                setCourses(updatedCourses);
                setCheck(isConfirmed);
                setIsConfirm(false);

                if (checkhasPermissionError) {
                    // Ném lỗi "Không có quyền truy vấn lịch sử!!" ra ngoài
                    throw new Error("Kết quả không tồn tại trong blockchain");
                    // throw new "ddasdsdasdads";
                }
                else if (isConfirmed) {
                    toast.success("Xác thực dữ liệu thành công!!!");
                } else {
                    toast.error("Một trong các kết quả có dữ liệu không đồng bộ", {
                        autoClose: 2000,
                        style: {
                            background: 'red',
                        }
                    });
                }
            } catch (err) {
                // Xử lý lỗi tổng quan ở đây nếu cần thiết
                console.log(err);
                toast.error(err.message, {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
                setIsConfirm(false);
            }
        }
    }


    console.log("courses", courses)

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
            <section className="px-5 xl:px-0 container pt-5">
                <div className="max-w-[1170px] mx-auto rounded">
                    <div className="flex flex-row justify-between gap-5 m-5">
                        <div className='rounded-md border-2 border-black'>
                            <Link to={"/teacher"} className="flex justify-between">
                                <span className='items-center gap-3 rounded-md px-1 py-2'>
                                    <FaArrowRotateLeft />
                                </span>
                                <span className='hidden text-base font-semibold xl:block p-1'>
                                    Quay lại
                                </span>
                            </Link>
                        </div>
                        <div className='flex justify-end'>
                            {check == false ? (
                                <>
                                    {!isConfirm ? (
                                        <button className='flex justify-center rounded-lg bg-primaryColor text-white p-1' onClick={handleClickCheck}>
                                            <span className=' text-base font-semibold xl:block px-5 py-1'>
                                                Kiểm tra
                                            </span>
                                        </button>
                                    ) : (
                                        <LoadingSpinner />
                                    )}
                                </>
                            ) : (
                                <ReactToPrint
                                    trigger={() => (
                                        <button className='flex justify-center rounded-lg bg-primaryColor text-white p-1'>
                                            <span className=' text-base font-semibold xl:block px-5 py-1'>
                                                In Điểm
                                            </span>
                                        </button>
                                    )}
                                    content={() => componentRef.current}
                                />
                            )}
                        </div>
                    </div>
                    <div ref={componentRef}>
                        {loading && <h4 className="text-center pt-5">Loading.....</h4>}
                        {error && <h4 className="text-center pt-5">{error}</h4>}
                        {!loading && !error && (
                            <>
                                <div className="gap-5 m-5 ">
                                    <h1 className='text-[15px]'>Đại học Cần Thơ</h1>
                                    <h1 className='text-[15px]'>Bảng điểm lớp học phần</h1>
                                    <table className='table_export'>
                                        <tbody className=''>
                                            <tr>
                                                <td className='column_left'>Tên Giảng Viên</td>
                                                <td className='column_right'>
                                                    <strong>{user.name}</strong>
                                                    <font>
                                                        - &nbsp; Mã số : <strong>{user.msgv}</strong>
                                                    </font>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='column_left'>Mã Lớp</td>
                                                <td className='column_left'>{couserTable.groupMa}</td>
                                            </tr>
                                            <tr>
                                                <td className='column_left'>Mã học phần</td>
                                                <td className='column_left'>{couserTable.subjectMa}</td>
                                            </tr>
                                            <tr>
                                                <td>Tên học phần</td>
                                                <td>{couserTable.groupTen}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <h2>Học kỳ {couserTable.semester} - năm học {couserTable.year}-{parseInt(couserTable.year, 10) + 1}</h2>
                                </div>

                                <table className='table_export'>
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th className='text-left'>Mã sinh viên</th>
                                            <th className='text-left'>Tên sinh viên</th>
                                            <th>Điểm số</th>
                                            <th>Điểm Chữ</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-center'>
                                        {courses != "" && courses.map((result, index) => {
                                            let grade;
                                            if (result.score >= 8) {
                                                grade = "A";
                                            } else if (result.score >= 6) {
                                                grade = "B";
                                            } else if (result.score >= 4) {
                                                grade = "C";
                                            } else if (result.score >= 0) {
                                                grade = "F";
                                            } else {
                                                grade = "";
                                            }
                                            return (
                                                // <tr key={index} className={result.confirm == false ? 'text-red-500' : ''}>
                                                <tr key={index} className={result.confirm === false ? 'text-red-500' :
                                                    (result.score == undefined && result.confirm != undefined && compare ? 'text-blue-500' : '')}>
                                                    <td>{index + 1}</td>
                                                    <td className='text-left'>{result.studentMS}</td>
                                                    <td className='text-left'>{result.studentName}</td>
                                                    <td>{result.score || ""}</td>
                                                    <td>{grade}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <table className='table_export mt-5'>
                                    <tbody>
                                        <tr>
                                            <td>Ghi chú : </td>
                                            <td>+ Kết quả có màu đỏ là kết quả bị lỗi.</td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>+ Bảng điểm lớp học phần chỉ được in khi đã nhập đủ điểm</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default TeacherExport