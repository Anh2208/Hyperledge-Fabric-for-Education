import React, { useEffect, useState, useContext } from 'react'
import axios from "axios";
import { Link } from 'react-router-dom'
import { BASE_URL } from '../../utils/config';
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { AuthContext } from '../../context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';
import "./teacher.css"

const TeacherScore = () => {

    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');// lưu trạng thái chọn học phần
    const [listedCourse, setListedCourse] = useState(''); // khi click "liệt kê" sẽ lấy value của học phần đang chọn
    const [isRegistering, setIsRegistering] = useState(false);// tạo trạng thái loading khi nhấn nút "Lưu"
    const [courseTableID, setCourseTableID] = useState('');

    const fetchData = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.post(`${BASE_URL}group/getGroup/getGroupbyMSGV`, {
                msgv: user.msgv,
            });

            setCourses(response.data.data);
            if (response.data.data && selectedCourse == '') {
                setSelectedCourse(response.data.data[0].groupTen);
                setListedCourse(response.data.data[0].groupTen);
                setCourseTableID(response.data.data[0]._id)
                console.log("listedCourse is", listedCourse);
            }
            console.log("courses is", response.data.data);

        } catch (err) {
            console.log("Lỗi dữ liệu");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = e => {
        setSelectedCourse(e.target.value);
        setEditedScores({});
        setIsEditing(false);
    };
    const handleClickListed = (e) => {
        setListedCourse(selectedCourse);
        setEditedScores({});
        setIsEditing(false);

        const currentTable = courses.find(course => course.groupTen === selectedCourse);
        setCourseTableID(currentTable._id);
    }

    // Cập nhật điểm sinh viên
    const [isEditing, setIsEditing] = useState(false);
    const [editedScores, setEditedScores] = useState({});

    // Lưu danh sách
    const handleClickSave = async (e) => {
        e.preventDefault();
        setIsRegistering(true);
        console.log("editedScores.length", editedScores);
        if (Object.keys(editedScores).length === 0) { // Kiểm tra xem editedScores có rỗng hay không
            toast.error('Không có học phần cần cập nhật');
            setIsRegistering(false);
            return;
        }
        try {
            // Tạo một bản sao của các khóa học để cập nhật trạng thái React
            const updatedCourses = [...courses]; // Tạo một bản sao của courses

            // Lặp qua các khóa học
            for (let i = 0; i < updatedCourses.length; i++) {
                const course = updatedCourses[i];

                // Kiểm tra xem khóa học có phải là khóa học được chọn
                if (course.groupTen === selectedCourse) {
                    const updatedResults = [...course.results]; // Tạo bản sao của kết quả

                    // Lặp qua kết quả của khóa học
                    for (let j = 0; j < updatedResults.length; j++) {
                        const studentResult = updatedResults[j];
                        const editedScore = editedScores[studentResult.studentMS];

                        if (editedScore) {
                            // Gửi dữ liệu lên máy chủ
                            const axiosInstance = axios.create({
                                withCredentials: true
                            });

                            if (studentResult.score === undefined) {
                                // const response = await axiosInstance.put(`${BASE_URL}result/ResultMongo/update`, {
                                const response = await axiosInstance.put(`${BASE_URL}result/ResultBlock/create`, {
                                    data: editedScore,
                                    groupID: course._id,
                                    access: course.access,
                                });
                            } else {
                                const response = await axiosInstance.put(`${BASE_URL}result/ResultBlock/update`, {
                                    data: editedScore,
                                    groupID: course._id,
                                    access: course.access,
                                });
                                console.log("dasdasda");
                            }
                            toast.success(`Cập nhật học phần cho sinh viên ${studentResult.studentMS}`);

                        }

                        // Cập nhật kết quả với dữ liệu chỉnh sửa hoặc dữ liệu gốc
                        updatedResults[j] = editedScore || studentResult;
                    }

                    // Cập nhật khóa học với kết quả đã được cập nhật
                    updatedCourses[i] = { ...course, results: updatedResults };
                }
            }

            // Cập nhật trạng thái React
            setCourses(updatedCourses);
            setEditedScores({});
            setIsEditing(false);
        } catch (err) {
            // console.log("loi la ", err.response.data.message);
            toast.error(err.response.data.message, {
                autoClose: 2000,
                style: {
                    backgroundColor: 'red'
                }
            });
            setCourses(courses);
            setEditedScores({});
        } finally {
            setIsRegistering(false);
        }
    }

    const handleCancel = () => {
        setEditedScores({});
        setIsEditing(false);
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
            <section className="px-5 xl:px-0 container pt-5">
                <div className="max-w-[1170px] mx-auto rounded border-2 border-black">
                    <div className="flex flex-row justify-between gap-5 m-5">
                        <div className='p-1 rounded-md border-2 border-black'>
                            <Link to={"/teacher"} className="flex justify-between">
                                <span className='items-center gap-3 rounded-md px-1 py-2'>
                                    <FaArrowRotateLeft />
                                </span>
                                <span className='hidden text-base font-semibold xl:block p-1'>
                                    Quay lại
                                </span>
                            </Link>
                        </div>
                        <div className=' bg-cyan-200 rounded-md'>
                            <Link to={`/teacher/score/export/${courseTableID}`}>
                                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                                    Export Điểm
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="gap-5 m-5 title_list">
                        <h1 className='text-[30px]'>DANH SÁCH ĐIỂM SINH VIÊN</h1>
                        <div className='flex flex-row justify-center gap-3'>
                            <div className="flex items-center">
                                <a>Học phần: </a>
                            </div>
                            {/* <div className="mb-10 flex items-center justify-between"> */}
                            <label className="text-headingColor font-bold text-[16px] leading-7">
                                {Array.isArray(courses) ? (
                                    <select
                                        // id="role"
                                        value={selectedCourse}
                                        onChange={handleChange}
                                        className="text-textColor rounded-md border-2 font-semibold text-[15px] leading-7 p-1"
                                    >
                                        {courses?.map((course, index) => (
                                            <option key={index} value={course.groupTen}>
                                                {course.groupTen} - {course.groupMa}
                                            </option>
                                        ))}
                                    </select>
                                ) : null}
                            </label>
                            {/* </div> */}
                            <button onClick={handleClickListed} className="bg-primaryColor p-2 text-white font-[600] h-[30px] flex items-center rounded-md">
                                <span>Liệt kê</span>
                            </button>
                        </div>
                    </div>
                    <table className='border table-score mx-auto' >
                        <thead>
                            <tr>
                                <th className='border border-black'>STT</th>
                                <th className='border border-black'>Mã sinh viên</th>
                                <th className='border border-black'>Tên sinh viên</th>
                                <th className='border border-black'>Điểm số</th>
                                <th className='border border-black'>Điểm Chữ</th>
                                {/* <th className='border border-black'>Hành động</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(courses) ? courses.map((course, index) => (
                                course.groupTen === listedCourse && (
                                    course.results.map((studentResult, resultIndex) => {
                                        let grade;
                                        if (studentResult.score >= 8) {
                                            grade = "A";
                                        } else if (studentResult.score >= 6) {
                                            grade = "B";
                                        } else if (studentResult.score >= 4) {
                                            grade = "C";
                                        } else if (studentResult.score >= 0) {
                                            grade = "F";
                                        } else {
                                            grade = "";
                                        }
                                        return (
                                            <tr key={resultIndex}>
                                                <td className='border border-black'>{resultIndex + 1}</td>
                                                <td className='border border-black'>{studentResult.studentMS}</td>
                                                <td className='border border-black text-left'>{studentResult.studentName}</td>
                                                {/* <td className='border border-black'>
                                                    <input className='w-5' type="number" value={studentResult.score || ""} disabled />
                                                </td> */}
                                                <td className='border border-black'>
                                                    {isEditing ? (
                                                        <input
                                                            className='w-8'
                                                            type="number"
                                                            placeholder={studentResult.score}
                                                            value={editedScores[studentResult.studentMS]?.score || ""}
                                                            onChange={(e) => {
                                                                if (studentResult.score != e.target.value) {
                                                                    setEditedScores({
                                                                        ...editedScores,
                                                                        [studentResult.studentMS]: {
                                                                            ...studentResult,
                                                                            score: e.target.value,
                                                                        },
                                                                    })
                                                                }

                                                            }
                                                            }
                                                        />
                                                    ) : (
                                                        <a>
                                                            {studentResult.score || ""}
                                                        </a>
                                                    )}
                                                </td>

                                                <td className='border border-black'>{grade}</td>
                                            </tr>
                                        );
                                    })
                                )
                            )) : null}
                        </tbody>
                    </table>
                    <div>
                        <div className="flex justify-end p-5 gap-5">
                            <div>
                                {isEditing ? (
                                    <>
                                        {!isRegistering ? (
                                            <button className='flex justify-center rounded-lg bg-primaryColor text-white p-1' onClick={handleClickSave}>
                                                <span className=' text-base font-semibold xl:block px-5 py-1'>
                                                    Lưu
                                                </span>
                                            </button>
                                        ) : (
                                            <LoadingSpinner />
                                        )}
                                    </>

                                ) : (
                                    <button className='flex justify-center rounded-lg bg-primaryColor text-white p-1' onClick={() => setIsEditing(true)}>
                                        <span className=' text-base font-semibold xl:block px-5 py-1'>
                                            Cập nhật
                                        </span>
                                    </button>)
                                }
                            </div>

                            {isEditing ? (
                                <>
                                    {!isRegistering ? (
                                        <div>
                                            <button className='flex justify-center rounded-lg bg-primaryColor text-white p-1' onClick={handleCancel}>
                                                <span className=' text-base font-semibold xl:block px-5 py-1'>
                                                    Hủy
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        null
                                    )}
                                </>
                            ) : (
                                null
                            )}
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default TeacherScore
