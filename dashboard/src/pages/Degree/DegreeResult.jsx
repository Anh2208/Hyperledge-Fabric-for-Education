import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/config';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaArrowRotateLeft, FaSearchengin } from 'react-icons/fa6';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';

const DegreeResult = () => {
    const [degree, setDegree] = useState([]);
    const [image, setImage] = useState('');
    const [mssv, setMssv] = useState(''); // Thêm state và khởi tạo giá trị ban đầu là ''
    const [state, setState] = useState(false);
    const fetchData = async () => {
        setState(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            const response = await axiosInstance.get(`${BASE_URL}degree`, {
                params: { mssv: mssv } // Sử dụng giá trị từ ô input
            });

            setDegree(response.data.data);
            console.log("response.data.data.image is", response.data.data.image);
            const adjustedImage = response.data.data.image.replace('data', 'data:').replace('base64', ';base64,');
            // const adjustedImage = `data:image/jpg;base64,${btoa(response.data.data.image)}`;
            console.log("adjustedImage is", adjustedImage);

            setImage(response.data.data.image);
            toast.success("Xác thực dữ liệu thành công!!!");
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
        setState(false);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    }

    function formatDate(dateString) {// Định dạng ngày
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
    // console.log("Degree is", image);
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
                <div className="content-header mb-10">
                    <div className="flex flex-row gap-5 m-5">
                        <div className='p-1 rounded-md border-2 border-black'>
                            <Link to={`/degree`} className="flex justify-between">
                                <span className='items-center gap-3 rounded-md px-1 py-2'>
                                    <FaArrowRotateLeft />
                                </span>
                                <span className='hidden text-base font-semibold xl:block p-1'>
                                    Quay lại
                                </span>
                            </Link>
                        </div>
                    </div>
                    <div className="mr-10">
                        <form className='form-degree border-2 shadow-lg border-black' role="search">
                            <input
                                id="search"
                                type="search"
                                placeholder="Tìm kiếm..."
                                autoFocus
                                required
                                value={mssv} // Gán giá trị từ state
                                onChange={(e) => setMssv(e.target.value)} // Cập nhật giá trị state khi người dùng thay đổi ô input
                            />
                            <button type="submit" onClick={handleSearch}>Tìm</button>
                        </form>
                    </div>
                    <div>
                        {state && <LoadingSpinner />}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 p-2 gap-5 card mb-4 h-[460px]">
                    <div className='col-span-3 hover14 column'>
                        {image && (
                            <div className='flex justify-center'>
                                <figure><img src={`${image}`} alt="Bằng cấp" className='rounded-lg shadow-2xl h-[470px]' /></figure>
                                {/* <figure><img src={`data:${image}`} alt="Bằng cấp" className='rounded-lg shadow-2xl h-[470px]' /></figure> */}
                            </div>
                        )}
                    </div>
                    <div className="col-span-2 rounded-lg border-2 border-black items-center test-bg">
                        {degree != '' && (
                            <div className="relative flex-auto degree_form mx-2">
                                <h1 className='mt-10 uppercase decoration-slice decoration-black'>BẰNG {degree.degreeType}</h1>
                                <table className='table-degree-search mx-auto text-left gap-4 p-5 my-10'>
                                    <tbody className=''>
                                        <tr>
                                            <td className='min-w-[150px]'>Ngành đào tạo</td>
                                            <td className='font-bold'>{degree.major}</td>
                                        </tr>
                                        <tr>
                                            <td>Tên</td>
                                            <td className='font-bold'>{degree.studentName}</td>
                                        </tr>
                                        <tr>
                                            <td>Ngày sinh</td>
                                            <td className='font-bold'>{formatDate(degree.studentDate)}</td>
                                        </tr>
                                        <tr>
                                            <td>Xếp loại đào tạo</td>
                                            <td className='font-bold'>{degree.classification}</td>
                                        </tr>
                                        <tr>
                                            <td>Hình thức đào tạo</td>
                                            <td className='font-bold'>{degree.formOfTraining}</td>
                                        </tr>
                                        <tr>
                                            <td>Số hiệu</td>
                                            <td className='font-bold'>{degree.code}</td>
                                        </tr>
                                        <tr>
                                            <td>Số vào sổ</td>
                                            <td className='font-bold'>{degree.inputbook}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default DegreeResult;
