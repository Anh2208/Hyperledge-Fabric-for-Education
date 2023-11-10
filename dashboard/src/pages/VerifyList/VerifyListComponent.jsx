import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { BASE_URL } from '../../utils/config'
import axios from 'axios'
import './verify.css'

const VerifyListComponent = () => {
    const [students, setStudents] = useState([]);
    // const [state, setState] = useState(false);

    const fetchData = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            const response = await axiosInstance.get(`${BASE_URL}verify`);
            console.log(response);
            setStudents(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);



    function formatDate(dateString) {// Định dạng ngày
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    const handleVerify = async (student) => {
        if (window.confirm("Khi xác nhận cấp bằng sẽ không thể hoàn tác")) {
            try {

                const axiosInstance = axios.create({
                    withCredentials: true,
                });

                await axiosInstance.put(`${BASE_URL}verify`, {
                    email: student.email,
                    mssv: student.mssv,
                    class: student.class,
                    name: student.name,
                    date: student.date,
                    sex: student.sex,
                    state: true,
                });
                fetchData();
                toast.success("Xác nhận bằng tốt nghiệp thành công");
            } catch (e) {
                console.log(e);
                toast.error(e.response.data.message ? e.response.data.message : "xác nhận bằng tốt nghiệp thất bại", {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
            }
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
            <section className='content-main'>
                <div className="content-header">
                    <h2 className="content-title">Danh sách sinh viên tốt nghiệp</h2>
                    <div className=' bg-cyan-200 rounded-md'>
                        <Link to={`/verify/management`}>
                            <button className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                                Quản lý danh sách
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="gap-5 m-5 title_list">
                    <h1 className='text-[30px] mt-5'>DANH SÁCH SINH VIÊN</h1>
                </div>
                <table className='table-result mx-auto border-separate border border-slate-400'>
                    <thead>
                        <tr className='bg-cyan-300'>
                            <th className='max-w-[20px]'>STT</th>
                            <th className='max-w-[40px]'>Mã lớp</th>
                            <th className='max-w-[40px]'>MSSV</th>
                            <th className='w-[150px]'>Họ Tên</th>
                            <th className='overflow-hidden'>Email</th>
                            <th className='w-[80px]'>Giới tính</th>
                            <th className='w-[90px]'>Ngày sinh</th>
                            <th >Xác nhận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students && students.map((student, index) => {
                            return (
                                <tr key={index}>
                                    <td className='text-center'>{index + 1}</td>
                                    <td className='max-w-[40px] text-left'>{student.class}</td>
                                    <td className='text-center max-w-[40px]'>{student.mssv}</td>
                                    <td className='text-left'>{student.name}</td>
                                    <td className='max-w-[100px] overflow-hidden text-left'>{student.email}</td>
                                    <td className='text-center'>{student.sex}</td>
                                    <td>{formatDate(student.date)}</td>
                                    {student.state == true ? (
                                        <td className='w-[120px]'>
                                            <button className='text-white bg-green-500 px-2 py-1 font-bold rounded-md' disabled>
                                                < span className=''>Đã xác nhận</span>
                                            </button>
                                        </td>
                                    ) : (
                                        <td className='w-[120px]'>
                                            <button onClick={() => handleVerify(student)} className='text-white bg-blue-500 px-5 py-1 font-bold rounded-md' style={{ cursor: 'pointer' }}>
                                                < span className=''>Xác nhận</span>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </section>
        </>
    )
}

export default VerifyListComponent