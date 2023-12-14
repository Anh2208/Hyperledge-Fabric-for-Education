import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRotateLeft, FaEye } from 'react-icons/fa6';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';


const EditScore = () => {
    const [isConfirm, setIsConfirm] = useState(false);
    const [addStatus, setAddStatus] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState(false);
    const [result, setResult] = useState([]);
    const [list, setList] = useState([]);
    const [groupMa, setGroupMa] = useState('');
    const [subjectMS, setSubjectMS] = useState('');
    const [studentMS, setStudentMS] = useState('');
    const [semester, setSemester] = useState('');
    const [date_awarded, setDate_awarded] = useState('');
    const [email, setEmail] = useState('');

    const handleClick = async () => {
        setIsConfirm(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });
            const response = await axiosInstance.post(`${BASE_URL}result/search/block/getDetailGroup`, {
                groupMa: groupMa,
                subjectMS: subjectMS,
                studentMS: studentMS,
                semester: semester,
                date_awarded: date_awarded,
            })
            if (response) {
                setResult(response.data.data);
                setList(response.data.data.permissionGranted);
            }
        } catch (e) {
            toast.error(e.response.data.message, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
            console.log("loi la", e);
        }
        setIsConfirm(false);
    }

    const handleAdd = async () => {
        setAddStatus(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            await axiosInstance.post(`${BASE_URL}result/access/grantAccessResult`, {
                resultID: result.resultID,
                subjectMS: result.subjectMS,
                studentMS: result.studentMS,
                email: email
            })

            toast.success("Cập nhật quyền thành công!!!");
            handleClick();
        } catch (e) {
            toast.error(e.response.data.message, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
        setAddStatus(false);
    }

    const handleRevoke = async (email) => {
        setDeleteStatus(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            await axiosInstance.post(`${BASE_URL}result/access/revokeAccessResult`, {
                resultID: result.resultID,
                subjectMS: result.subjectMS,
                studentMS: result.studentMS,
                email: email
            })

            toast.success("Cập nhật quyền thành công!!!");
            handleClick();
        } catch (e) {
            toast.error(e.response.data.message, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
        setDeleteStatus(false);
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

                <div className='table-content my-4 flex justify-between'>
                    <div className="w-full max-w-lg">
                        {/* <h1 className='text-[30px] text-center'>Danh sách thành viên chỉnh sửa điểm</h1> */}
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
                                        Mã lớp học phần
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="groupMa"
                                        type="text"
                                        placeholder="Mã lớp học phần"
                                        value={groupMa}
                                        onChange={(e) => setGroupMa(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='flex gap-5'>
                                <div className="mb-10">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        MSSV
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="studentMS"
                                        type="text"
                                        placeholder="MSSV"
                                        value={studentMS}
                                        onChange={(e) => setStudentMS(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Học kỳ
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="semester"
                                        type="number"
                                        placeholder="Học kỳ"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Năm học
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="date_awarded"
                                        type="number"
                                        placeholder="Năm học"
                                        value={date_awarded}
                                        onChange={(e) => setDate_awarded(e.target.value)}
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
                                        onClick={handleClick}
                                    >
                                        Kiểm tra
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                    {result != '' ? (
                        <div className="w-full max-w-lg">
                            {/* <h1 className='text-[30px] text-center'>Danh sách </h1> */}
                            <div className='bg-white shadow-md rounded px-8 py-6'>
                                <h1 className=''>Người dùng có quyền chỉnh sửa</h1>
                                <table className='w-full'>
                                    <tbody>
                                        {Array.isArray(list) && list.map((element, index) => {
                                            return (
                                                <>
                                                    <tr key={index}>
                                                        <td>Email:</td>
                                                        <td>{element}</td>
                                                        <td className='flex justify-center'>
                                                            {deleteStatus ? (
                                                                <LoadingSpinner />
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRevoke(element)}
                                                                    className="bg-red-500 w-[50px] flex justify-center hover.bg-blue-700 text-white font-bold py-2 px-5 my-2 rounded focus:outline-none focus:shadow-outline"
                                                                    type="button"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <div className='flex justify-between p-5'>
                                    <input type="text" className='py-2 px-5 mt-5 shadow-md rounded-md border-2 border-black' onChange={(e) => setEmail(e.target.value)} />
                                    {addStatus ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <button
                                            className="bg-blue-500 hover.bg-blue-700 text-white font-bold py-2 px-5 mt-5 rounded focus:outline-none focus:shadow-outline"
                                            type="button"
                                            onClick={handleAdd}
                                        >
                                            Thêm
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>
        </>
    )
}

export default EditScore