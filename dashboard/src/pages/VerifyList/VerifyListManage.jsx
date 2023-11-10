import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BASE_URL } from '../../utils/config'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import './verify.css'
import axios from 'axios';

const VerifyListManage = () => {
    const [students, setStudents] = useState([]);
    const [mssv, setMssv] = useState('');

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

    const handleCreate = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });
            console.log("hahahaha", mssv);
            await axiosInstance.post(`${BASE_URL}verify`, {
                mssv: mssv,
            });
            fetchData();
            toast.success(`Thêm thành công sinh viên với mã số ${mssv} !!!`);
        } catch (err) {
            console.log("Lỗi thêm verify", err);
            toast.error(err.response.data.message ? err.response.data.message : err, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
    }

    const handleDelete = async (mssv) => {
        try {
            if (window.confirm("Bạn có thực sự muốn xóa???")) {
                const axiosInstance = axios.create({
                    withCredentials: true,
                });
                await axiosInstance.delete(`${BASE_URL}verify`, {
                    params: { mssv: mssv }
                });
                fetchData();
                toast.success(`Xóa thành công sinh viên ${mssv}`);
            }

        } catch (err) {
            console.log("loi xoa verify", err.response.data.message);
            toast.error(err, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
    }

    const handleChange = (e) => {
        const { value } = e.target;
        setMssv(value);
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
                    <div className="flex flex-row gap-5 m-5">
                        <div className='p-1 rounded-md border-2 border-black'>
                            <Link to={`/verify`} className="flex justify-between">
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

                <div className="gap-5 m-5 flex flex-row justify-between">
                    <div>
                        <h1 className='text-[30px]'>DANH SÁCH SINH VIÊN</h1>
                    </div>
                    <div className=' flex'>
                        <form className='form-degree-verify w-[200px] flex border-2 shadow-lg border-black' role="search">
                            <input
                                id="search"
                                type="search"
                                placeholder="Thêm sinh viên..."
                                // autoFocus
                                required
                                value={mssv} // Gán giá trị từ state
                                onChange={handleChange} // Cập nhật giá trị state khi người dùng thay đổi ô input
                            />
                        </form>
                        {/* <input type="text" placeholder='Nhập mã sinh viên...' /> */}
                        <button onClick={handleCreate} className="bg-primaryColor mx-2 px-6 mt-1 text-white font-[600] h-[44px] items-center rounded-md" style={{ cursor: 'pointer' }}>
                            Thêm
                        </button>
                    </div>
                </div>
                <table className='table-result mx-auto border-separate border border-slate-400 '>
                    <thead>
                        <tr className='bg-cyan-300'>
                            <th className='max-w-[20px]'>STT</th>
                            <th className='max-w-[40px]'>Mã lớp</th>
                            <th className='max-w-[40px]'>MSSV</th>
                            <th className='w-[150px]'>Họ Tên</th>
                            <th className='overflow-hidden'>Email</th>
                            <th className='w-[80px]'>Giới tính</th>
                            <th className='w-[90px]'>Ngày sinh</th>
                            <th className='max-w-[50px]'></th>
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
                                    <td className='w-[60px] text-center justify-center'>
                                        <button
                                            onClick={() => handleDelete(student.mssv)}
                                            className="rounded-full bg-orange-200 py-[3px] px-3 text-xs text-orange-900 transition-all hover:bg-orange-100"
                                        >
                                            Xóa
                                        </button>

                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </section>
        </>
    )
}

export default VerifyListManage