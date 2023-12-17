import React, { useEffect, useState } from 'react'
import axios from "axios";
import { Link } from 'react-router-dom'
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';
import "./result.css"

const ResultComponent = () => {

    // const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');// lưu trạng thái chọn học phần
    const [listedCourse, setListedCourse] = useState(''); // khi click "liệt kê" sẽ lấy value của học phần đang chọn
    const [isRegistering, setIsRegistering] = useState(false);// tạo trạng thái loading khi nhấn nút "Lưu"
    const [courseTableID, setCourseTableID] = useState('');
    const [checkedSynchronization, setCheckedSynchronization] = useState(false);

    const fetchData = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.get(`${BASE_URL}group/getGroup/getAll`);
            const check = await axiosInstance.post(`${BASE_URL}result/check/checkAllResult`, {
                data: response.data.data,
            });
            setCourses(check.data.data);

            if (response.data.data && selectedCourse == '') {
                setSelectedCourse(response.data.data[0].groupTen);
                setListedCourse(response.data.data[0].groupTen);
                setCourseTableID(response.data.data[0]._id);
            }
        } catch (err) {
            console.log("Lỗi dữ liệu");
        }
    };

    // console.log("courses is", courses);
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Chỉ kiểm tra đồng bộ khi component được hiển thị lần đầu
        if (!checkedSynchronization && Array.isArray(courses) && courses.length > 0) {
            checksynchronized();
            setCheckedSynchronization(true);
        }
    }, [courses, checkedSynchronization]);

    console.log("heelo")
    const handleChange = e => {
        setSelectedCourse(e.target.value);
        setEditedScores({});
        setIsEditing(false);
    };
    const handleClickListed = (e) => {
        setListedCourse(selectedCourse);
        setEditedScores({});
        setIsEditing(false);
        checksynchronized();
        //change
        const currentTable = courses.find(course => course.groupTen === selectedCourse);
        setCourseTableID(currentTable._id);
    }
    const checksynchronized = () => {
        for (let i = 0; i < courses.length; i++) {
            if (courses[i].synchronized == false) {
                toast.error(`Lớp học phần ${courses[i].groupMa} có điểm không đồng bộ!!!`, {
                    autoClose: 2000,
                    style: {
                        backgroundColor: 'red'
                    }
                });
            }
        }
        console.log("my check check");
    }
    // Cập nhật điểm sinh viên
    const [isEditing, setIsEditing] = useState(false);
    const [editedScores, setEditedScores] = useState({});

    // Lưu danh sách
    const handleClickSave = async (e) => {
        e.preventDefault();
        setIsRegistering(true);
        console.log("editedScores.length", editedScores);
        // Kiểm tra xem editedScores có rỗng hay không
        if (Object.keys(editedScores).length === 0) {
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
                                await axiosInstance.put(`${BASE_URL}result/ResultBlock/create`, {
                                    data: editedScore,
                                    groupID: course._id,
                                    access: course.access,
                                });
                            } else {
                                await axiosInstance.put(`${BASE_URL}result/ResultBlock/update`, {
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
            if (err.response.data.message.includes('Identity not found in wallet')) {
                toast.error("Chưa được cấp hoặc không có quyền cập nhật điểm!!", {
                    autoClose: 2000,
                    style: {
                        backgroundColor: 'red'
                    }
                });
            }
            else {
                toast.error(err.response.data.message, {
                    autoClose: 2000,
                    style: {
                        backgroundColor: 'red'
                    }
                });
                // window.location.reload();
            }
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
            <section className='content-main'>
                <div className="content-header">
                    <h2 className="content-title">Điểm lớp học phần</h2>
                    <div className='rounded-md'>
                        {courses.length > 0 ? (
                            <Link to={`/result/export/${courseTableID}`}>
                                <button className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                                    In Điểm
                                </button>
                            </Link>
                        ) : (
                            <LoadingSpinner />
                        )}
                    </div>
                </div>
                {courses.length > 0 ? (
                    <div className=''>
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
                                    Liệt kê
                                </button>
                            </div>
                            <div className='mx-auto flex' >
                                {Array.isArray(courses) ? courses.map((course, index) =>
                                    course.groupTen === listedCourse && (
                                        <div className='flex' key={index}>
                                            <h1><strong>Giảng Viên:</strong> {course.namegv}</h1> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                                            <h1> <strong>MSGV:</strong> &nbsp; {course.msgv}</h1> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                                            {/* <h1> <strong>Mã học phần:</strong> &nbsp; {course.subjectMa}</h1> */}
                                        </div>
                                    )
                                ) : (
                                    null
                                )}
                            </div>
                        </div>

                        <table className='table-score mx-auto border-separate border border-slate-400 ' >
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
                                                    <td className='border border-black '>{resultIndex + 1}</td>
                                                    <td className='border border-black '>{studentResult.studentMS}</td>
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
                            <div className="flex justify-end pt-5 gap-5">
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
                ) : null}
            </section>
        </>
    )
}

export default ResultComponent