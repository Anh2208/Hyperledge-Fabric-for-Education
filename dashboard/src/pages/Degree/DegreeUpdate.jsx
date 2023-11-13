import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { BASE_URL } from '../../utils/config';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';

const DegreeUpdate = () => {
    const [isConfirm, setIsConfirm] = useState(false);
    const [degree, setDegree] = useState([]);
    const [image, setImage] = useState('');
    const [mssv, setMssv] = useState(''); // Thêm state và khởi tạo giá trị ban đầu là ''
    const [state, setState] = useState(false);
    const [change, setChange] = useState({
        type: 'Kỹ s1ư',
        training: 'Chính quy',
        major: 'An toàn thông tin',
        number: '',
        inputbook: '',
        image: null
    });
    const fetchData = async () => {
        setState(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            const response = await axiosInstance.get(`${BASE_URL}degree`, {
                params: { mssv: mssv } // Sử dụng giá trị từ ô input
            });
            let updateInfor = {
                type: response.data.data.degreeType,
                training: response.data.data.formOfTraining,
                major: response.data.data.major,
                number: response.data.data.code,
                inputbook: response.data.data.inputbook,
            }
            setChange(updateInfor);
            setDegree(response.data.data);
            // const adjustedImage = response.data.data.image.replace('data', 'data:').replace('base64', ';base64,');
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

    const handleChange = (e) => {
        const { id, value } = e.target;
        setChange((prev) => ({ ...prev, [id]: value }));
    }

    function convertToBase64(e) {
        const file = e.target.files[0]; // Lấy tệp ảnh đầu tiên trong danh sách tệp đã chọn
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                console.log("tatatatatatata", reader.result.length);
                setImage(reader.result);
            };

            reader.readAsDataURL(file);
        }
    }

    function formatDate(dateString) {// Định dạng ngày
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }
    // console.log("Degree is", degree);

    const handleClick = async () => {
        setIsConfirm(true);
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });
            const response = await axiosInstance.put(`${BASE_URL}degree`, {
                degreeType: change.type,
                major: change.major,
                studentName: degree.studentName,
                studentDate: degree.studentDate,
                score: degree.score,
                studentMS: degree.studentMS,
                formOfTraining: change.training,
                code: change.number,
                inputbook: change.inputbook,
                image: image,
                oldNFT: degree.code,
            });
            console.log("Response is", response);
            toast.success("Cấp bằng thành công!!!");
            setIsConfirm(false);
        } catch (e) {
            console.log("Loi is", e);
            if (e.response.data.message != undefined && e.response.data.message == 'Không có quyền cập nhật bằng cấp') {
                toast.error(`Không có quyền cập nhật bằng cấp`, {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
            } else {
                toast.error(`${e}`, {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
            }
            setIsConfirm(false);
        }
        setIsConfirm(false);
    }
    // console.log("uasdsad", image);
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
                                placeholder="Mã bằng cấp cần tìm"
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
                {degree != '' && (
                    <div>
                        <div className="py-16 px-4 md:px-6 2xl:px-0 flex justify-center items-center 2xl:mx-auto ">
                            <div className="flex flex-col justify-start items-start w-full space-y-9">
                                <div className="flex flex-col xl:flex-row justify-center xl:justify-between space-y-6 xl:space-y-0 xl:space-x-6 w-full">
                                    <div className="xl:w-4/5 flex flex-col sm:flex-row xl:flex-col justify-center items-center bg-gray-100 dark:bg-gray-800 py-7 sm:py-0 xl:py-10 px-10 xl:w-full">
                                        <div className="">
                                            <img src={`d`} alt="" />
                                            {image && (
                                                <div>
                                                    <figure><img src={`${image}`} alt="Bằng cấp" className='rounded-lg shadow-2xl' /></figure>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <input type="file" id="image" hidden onChange={convertToBase64} accept="image/*" />
                                            <label className='image-label font-bold' htmlFor="image">Chọn ảnh</label>
                                            {/* <input type='file' name="uploadfile" id='image' className='max-w-[500px]' onChange={convertToBase64} accept="image/*" /> */}
                                        </div>
                                    </div>
                                    <div className="p-8 bg-gray-100 dark:bg-gray-800 flex flex-col lg:w-full xl:w-3/5">
                                        <h1 className='uppercase decoration-slice text-red-600 font-bold text-[20px]'>BẰNG {degree.degreeType}</h1>

                                        <label className="mt-8 text-base leading-4 text-gray-800 dark:text-gray-50">Tên</label>
                                        <div className="mt-2 flex-col">
                                            <div>
                                                <input className="border rounded-tl rounded-tr border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" readOnly value={degree.studentName || ''} />
                                            </div>
                                            <div className="flex-row flex mt-2">
                                                <div>
                                                    <label htmlFor="mssv">MSSV</label>
                                                    <input className="border rounded-bl border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" id='mssv' readOnly value={degree.studentMS || ''} />
                                                </div>
                                                <div>
                                                    <label htmlFor="studentDate">Ngày Sinh</label>
                                                    <input className="border rounded-bl border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" id='studentDate' readOnly value={formatDate(degree.studentDate) || ''} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row justify-center items-center mt-6">
                                            <hr className="border w-full" />
                                        </div>



                                        <div className="mt-2 flex-col">
                                            <label htmlFor="classification">Xếp loại</label>
                                            <div>
                                                <input className="border rounded-bl border-gray-300 rounded-lg p-4 text-base leading-4 placeholder-gray-600 text-gray-600" id='classification' readOnly value={degree.classification || ''} />
                                            </div>

                                        </div>
                                        <div className="flex flex-row justify-center items-center mt-6">
                                            <hr className="border w-full" />
                                        </div>
                                        <div className="mt-2 flex-col">
                                            <div className="flex-row flex mt-2 justify-between">
                                                <div className="relative">
                                                    <label className="mt-8 text-base leading-4 text-gray-800 dark:text-gray-50">Loại bằng : </label>
                                                    <select
                                                        id="type"
                                                        required
                                                        className='rounded-lg border-separate border border-slate-400 p-1 mt-2'
                                                        onChange={handleChange}
                                                        value={change.type}
                                                    >
                                                        <option value="Kỹ sư">Kỹ sư</option>
                                                        <option value="Thạc sĩ">Thạc sĩ</option>
                                                        <option value="Tiến sĩ">Tiến sĩ</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="training">Hệ đào tạo : </label>
                                                    <select
                                                        id="training"
                                                        required
                                                        className='rounded-lg border-separate border border-slate-403 p-2 mt-2'
                                                        onChange={handleChange}
                                                        value={change.training}
                                                    >
                                                        <option value="Chính quy">Chính quy</option>
                                                        <option value="Từ xa">Từ xa</option>
                                                    </select>
                                                    {/* <input className="border rounded-bl border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" type="email" name="" id="" placeholder="MM/YY" /> */}
                                                </div>
                                            </div>
                                        </div>

                                        <label className="mt-8 text-base leading-4 text-gray-800 dark:text-gray-50">Số hiệu</label>
                                        <div className="mt-2 flex-col">
                                            <div>
                                                <input className="border rounded border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" id='number' placeholder={degree.code} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <label className="text-base mt-2 leading-4 text-gray-800 dark:text-gray-50">Số vào sổ cấp bằng</label>
                                        <div className="mt-2 flex-col">
                                            <div>
                                                <input className="border rounded border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" id='inputbook' placeholder={degree.inputbook} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="mt-2 flex-col">
                                            <div className="relative">
                                                <label htmlFor="major">Chuyên ngành đào tạo</label><br />
                                                <input className="border rounded border-gray-300 p-4 w-full text-base leading-4 placeholder-gray-600 text-gray-600" id='major' placeholder={degree.major} readOnly />
                                            </div>

                                        </div>

                                        {!isConfirm ? (
                                            <button onClick={handleClick} className=" mt-8 border border-transparent hover:border-gray-300 dark:bg-white dark:hover:bg-gray-900 dark:text-gray-900 dark:hover:text-white dark:border-transparent bg-gray-900 hover:bg-white text-white hover:text-gray-900 flex justify-center items-center py-4 rounded w-full">
                                                <div>
                                                    <p className="text-base leading-4">Cập nhật </p>
                                                </div>
                                            </button>
                                        ) : (


                                            < LoadingSpinner />
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}

export default DegreeUpdate