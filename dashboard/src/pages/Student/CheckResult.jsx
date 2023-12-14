import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRotateLeft, FaEye } from 'react-icons/fa6';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';

const CheckResult = () => {

    const [subjectMS, setSubjectMS] = useState('');
    const [studentMS, setStudentMS] = useState('');
    const [results, setResults] = useState([]);
    const [student, setStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [isConfirm, setIsConfirm] = useState(false);

    const handleCheck = async () => {
        // console.log('Mã học phần:', subjectMS);
        // console.log('MSSV:', studentMS);
        setIsConfirm(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });
            const subjectresult = await axiosInstance.get(`${BASE_URL}subject/search/getSubjectByMS`, {
                params: { subjectMa: subjectMS }
            })
            const studentresult = await axiosInstance.get(`${BASE_URL}auth/getStudentByMSSV`, {
                params: { mssv: studentMS }
            })
            if (subjectresult.data.data == null || studentresult.data.data == null) {
                toast.error("Mã học phần hoặc Mã số sinh viên không hợp lệ", {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
                setIsConfirm(false);
                return;
            }
            const response = await axiosInstance.post(`${BASE_URL}result/search/getResultHistory`, {
                subjectMS: subjectMS,
                studentMS: studentMS,
            });

            setResults(response.data.data);
            setStudent(studentresult.data.data);
            setSubject(subjectresult.data.data);
            setIsConfirm(false);
            toast.success("Kiểm tra lịch sử thành công");
        } catch (err) {
            console.log("loi kiem tra", err);
            setIsConfirm(false);
            toast.error(err.response.data.message, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
    }

    // console.log("Result table is", results);
    // console.log("subject stusubjectdent is", subject);

    function formatDateTime(dateString) {
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
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
            <section className='content-main'>
                <div className="content-header mb-0">
                    <div className="flex flex-row gap-5 m-5">
                        <div className='p-1 rounded-md border-2 border-black'>
                            <Link to={`/student/`} className="flex justify-between">
                                <span className='items-center gap-3 rounded-md px-1 py-2'>
                                    <FaArrowRotateLeft />
                                </span>
                                <span className='hidden text-base font-semibold xl:block p-1'>
                                    Quay lại
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='table-content my-4 flex justify-center'>
                    <div className="w-full max-w-lg">
                        <h1 className='text-[30px] text-center'>Kiểm tra kết quả học tập</h1>
                        <form className="bg-white shadow-md rounded px-8 py-6">
                            <div className='flex gap-5'>
                                <div className="mb-10">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Mã học phần
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="subjectMS"
                                        type="text"
                                        placeholder="Mã học phần"
                                        value={subjectMS}
                                        onChange={(e) => setSubjectMS(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        MSSV
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="studentMS"
                                        type="text"
                                        placeholder="Mã số sinh viên"
                                        value={studentMS}
                                        onChange={(e) => setStudentMS(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center items-center">
                                {isConfirm ? (
                                    <LoadingSpinner />
                                ) : (
                                    <button
                                        className="bg-blue-500 hover.bg-blue-700 text-white font-bold p-2 px-5 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={handleCheck}
                                    >
                                        Kiểm tra
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    {results != '' &&
                        <div className='w-full max-w-lg'>
                            <h1 className='text-[30px] text-center'>Thông tin học phần</h1>
                            <div className='bg-white shadow-md rounded px-8 pt-6 pb-8 w-full'>
                                <table className='w-full infor-subject'>
                                    <tbody>
                                        <tr>
                                            <td>Tên học phần</td>
                                            <td>{subject.subjectTen}</td>
                                        </tr>
                                        <tr>
                                            <td>Số tín chỉ</td>
                                            <td>{subject.subjectSotc}</td>
                                        </tr>
                                        <tr>
                                            <td>MSSV:</td>
                                            <td>{student.mssv}</td>
                                        </tr>
                                        <tr>
                                            <td>Tên sinh viên:</td>
                                            <td>{student.name}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }
                </div>
                {results != '' && (
                    <div>
                        <h1 className='text-[30px] text-center'>Lịch sử cập nhật điểm</h1>
                        <table className='table-result mx-auto border-separate border border-slate-400 '>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã lớp HP</th>
                                    <th>Mã GV</th>
                                    <th>Điểm</th>
                                    <th>Học kỳ</th>
                                    <th>Năm học</th>
                                    <th>Thời gian</th>
                                    <th>Người thực hiện</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(results) && results.map((result, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{result.Value.groupMa}</td>
                                            <td>{result.Value.teacherMS}</td>
                                            <td>{result.Value.score}</td>
                                            <td>{result.Value.semester}</td>
                                            <td>{result.Value.date_awarded}</td>
                                            <td>{formatDateTime(result.Timestamp)}</td>
                                            <td>{result.Value.CN}</td>
                                            <td>{result.Value.action}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    )
}
export default CheckResult
