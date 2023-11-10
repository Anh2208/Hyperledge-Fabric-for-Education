import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { BASE_URL } from '../../utils/config';
import useAxios from '../../hooks/useAxios';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';
import './degree.css'

import myImage from '../../asset/images/choose.png';
const DegreeVerify = () => {

    const cardLinks = { image: myImage, };
    const [showModal, setShowModal] = React.useState(false);
    const [infor, setInfor] = useState({
        mssv: '',
        type: 'Engineer',
        training: 'formal',
        major: '1',
        number: '1'
    });
    const [hasPermissionError, setHasPermissionError] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);// tạo trạng thái loading khi nhấn nút "Lưu"
    const [check, setCheck] = useState(false);
    const [student, setStudent] = useState('');
    const [result, setResult] = useState([]);
    const [filteredResult, setFilteredResult] = useState([]);
    const [totalAccumulatedCredits, setTotalAccumulatedCredits] = useState(0);
    const [compare, setCompare] = useState(false);
    const [image, setImage] = useState(null);
    const fetchData = async () => {
        let testtotal = 0;

        try {

            const axiosInstance = axios.create({
                withCredentials: true,
            });

            const student = await axiosInstance.get(`${BASE_URL}auth/getStudentByMSSV`, {
                params: { mssv: infor.mssv }
            });

            const result = await axiosInstance.get(`${BASE_URL}result/search/mongodb/getResultByMSSV`, {
                params: { studentMS: infor.mssv }
            })
            setStudent(student.data.data);
            setResult(result.data.data);
            if (result.data.data) {// lọc các kết quả học tập thừa
                const resultData = result.data.data;
                const filteredResults = [];
                resultData.forEach((result) => {
                    const existingResult = filteredResults.find((filteredResult) => filteredResult.subjectMS === result.subjectMS);
                    if (!existingResult) {
                        filteredResults.push(result);
                        console.log("cinss", result.subjectSotc);
                        testtotal += parseFloat(result.subjectSotc);
                    } else {
                        if (result.score > existingResult.score) {
                            const index = filteredResults.indexOf(existingResult);
                            if (index !== -1) {
                                filteredResults[index] = result;
                            }
                        }
                    }
                });
                setFilteredResult(filteredResults);
            }

        } catch (e) {
            console.log("Err is", e);
        }
        setTotalAccumulatedCredits(testtotal);
        console.log("Tổng số tín chỉ là", testtotal);
    }
    console.log("tatatata", filteredResult);
    useEffect(() => {
        // Lấy giá trị infor từ localStorage nếu tồn tại
        const InforData = localStorage.getItem("InforDegree");
        if (InforData) {
            const data = JSON.parse(InforData);
            setInfor(data);
        }
        // Gọi fetchData khi infor thay đổi
        if (infor.mssv) {
            fetchData();
        }
    }, [infor.mssv]);

    const groupedResults = {}
    result.forEach((result) => {
        const academicYear = result.date_awarded;
        const semester = result.semester;
        if (!groupedResults[academicYear]) {
            groupedResults[academicYear] = {}
        }
        if (!groupedResults[academicYear][semester]) {
            groupedResults[academicYear][semester] = [];
        }
        groupedResults[academicYear][semester].push(result);
    });

    const academicYears = Object.keys(groupedResults).sort();

    // Hàm tính điểm trung bình một học kỳ
    const calculateSemesterGPA = (results) => {
        let totalCredits = 0;
        let totalScore = 0;
        results.forEach((result) => {
            totalCredits += parseFloat(result.subjectSotc);
            if (result.score == undefined) {
                totalScore = 0;
            } else {
                totalScore += parseFloat(result.score) * parseFloat(result.subjectSotc);
            }
        });
        return (totalScore / totalCredits) * 40 / 100;
    };

    function filterResults(results) {// tính tổng điểm trung bình tích lũy
        const filteredResults = [];
        let totalCredits = 0;
        let totalScore = 0;
        let kqua = 0;
        try {
            results.forEach((result) => {
                // Tìm kiếm xem kết quả có cùng subjectMS đã được thêm vào filteredResults chưa
                const existingResult = filteredResults.find((filteredResult) => filteredResult.subjectMS === result.subjectMS);

                if (!existingResult) {
                    // Nếu không tìm thấy kết quả trùng, thêm kết quả vào filteredResults
                    filteredResults.push(result);
                } else {
                    // Nếu tìm thấy kết quả trùng, so sánh điểm và giữ lại kết quả có điểm cao hơn
                    if (result.score > existingResult.score) {
                        // Thay thế kết quả trước đó bằng kết quả có điểm cao hơn
                        const index = filteredResults.indexOf(existingResult);
                        if (index !== -1) {
                            filteredResults[index] = result;
                        }
                    }
                }
            });
            filteredResults.forEach((result) => {
                totalCredits += parseFloat(result.subjectSotc);
                if (result.score == undefined) {
                    totalScore = 0;
                } else {
                    totalScore += parseFloat(result.score) * parseFloat(result.subjectSotc);
                }
                kqua = totalScore / totalCredits;
            });
        } catch (err) {
            console.log("err hien thi is", err);
        }
        return (kqua.toFixed(2) * 40 / 100).toFixed(2);
    }
    const totalResult = filterResults(result);

    // tổng số tín chỉ đã học trong 1 học kỳ
    const calculateTotalCreditsBySemester = () => {
        const totalCreditsBySemester = {};

        academicYears.forEach((academicYear) => {
            Object.keys(groupedResults[academicYear]).forEach((semester) => {
                const results = groupedResults[academicYear][semester];
                const totalCredits = results.reduce((total, result) => total + parseInt(result.subjectSotc), 0);
                totalCreditsBySemester[`${academicYear}-${semester}`] = totalCredits;
            });
        });

        return totalCreditsBySemester;
    };
    const totalCreditsBySemester = calculateTotalCreditsBySemester();

    // console.log("ket qua sau khi loc:", filteredResult);
    // kiểm tra sự chính xác của dữ liệu
    const handleClickCheck = async () => {
        setIsConfirm(true);
        let checkhasPermissionError = false;
        const hasResultWithoutScore = result.some((result) => {
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
                const checkResult = await Promise.all(result.map(async (result) => {
                    // try {
                    const axiosInstance = axios.create({
                        withCredentials: true,
                    })
                    const response = await axiosInstance.post(`${BASE_URL}result/check/checkResult/${result._id}`);
                    const isConfirmed = response.data.result;
                    // console.log("isConfirmed", isConfirmed);
                    // if (isConfirmed == undefined) {
                    //     return ({ ...result, confirm: true });
                    // } else {
                    //     return ({ ...result, confirm: isConfirmed });
                    // }
                    return ({ ...result, confirm: isConfirmed });
                    // } catch (err) {
                    //     console.log(err);
                    //     if (err.response.data.message === "Không có quyền truy vấn lịch sử!!") {
                    //         setHasPermissionError(true);
                    //         checkhasPermissionError = true;
                    //     }
                    //     return ({ ...result, confirm: false });
                    // }
                    // }

                }));
                const isConfirmed = checkResult.every((result) => result.confirm);
                setResult(checkResult);
                setCheck(isConfirmed);
                setIsConfirm(false);

                if (checkhasPermissionError) {
                    // Ném lỗi "Không có quyền truy vấn lịch sử!!" ra ngoài
                    throw new Error("Không có quyền truy vấn lịch sử!!");
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
                if (err.response.data.message.includes('Không có quyền kiểm tra và in điểm')) {
                    console.log("lỗi kiểm tra kết quả", err);
                    toast.error("Lỗi kiểm tra: Không có quyền kiểm tra và in điểm!!!", {
                        autoClose: 2000,
                        style: {
                            background: 'red',
                        }
                    });
                }
                else {
                    console.log("lỗi kiểm tra kết quả", err);
                    toast.error(err.message, {
                        autoClose: 2000,
                        style: {
                            background: 'red',
                        }
                    });
                }
            }
        }
        setIsConfirm(false);
        setCompare(true);
    }

    const handleClick = async () => {
        setIsConfirm(true);
        if (image == null) {
            setIsConfirm(false);
            toast.error("Chưa chọn ảnh", {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        } else {
            try {
                const axiosInstance = axios.create({
                    withCredentials: true,
                });
                const response = await axiosInstance.post(`${BASE_URL}degree`, {
                    degreeType: infor.type,
                    major: infor.major,
                    studentName: student.name,
                    studentDate: student.date,
                    score: totalResult,
                    studentMS: student.mssv,
                    formOfTraining: infor.training,
                    code: infor.number,
                    inputbook: infor.inputbook,
                    image: image
                });
                console.log("Response is", response);
                toast.success("Cấp bằng thành công!!!");
                setShowModal(false);
            } catch (e) {
                console.log("Loi is", e);
                toast.error(`${e.response.data.message}`, {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
                setIsConfirm(false);
            }
        }
        setIsConfirm(false);
    }

    function formatDate(dateString) {// Định dạng ngày
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    function convertToBase64(e) {
        const file = e.target.files[0]; // Lấy tệp ảnh đầu tiên trong danh sách tệp đã chọn
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                console.log("tatatatatatata", reader.result);
                setImage(reader.result);
            };

            reader.readAsDataURL(file);
        }
    }

    // console.log("file image is", image);
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
                            <Link to={`/degree/create`} className="flex justify-between">
                                <span className='items-center gap-3 rounded-md px-1 py-2'>
                                    <FaArrowRotateLeft />
                                </span>
                                <span className='hidden text-base font-semibold xl:block p-1'>
                                    Quay lại
                                </span>
                            </Link>
                        </div>
                    </div>
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
                        <>
                            <button className='flex justify-center rounded-lg bg-primaryColor text-white p-2 font-bold'
                                type="button"
                                onClick={() => setShowModal(true)}
                            >
                                Cấp bằng
                            </button>
                        </>

                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 p-2 gap-5">
                    <div className="rounded-lg border-2 border-black items-center" style={{ height: '300px' }} >
                        <h1 className="infor-user justify-center mb-3">Thông tin Sinh viên</h1>
                        {/* border-separate border border-slate-400   */}
                        <div className="grid grid-cols-4 gap-4 p-5" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 3fr' }}>
                            <div className='font-bold '>MSSV: </div>
                            <div>{student.mssv}</div>

                            <div className='font-bold' >Họ tên: </div>
                            <div>{student.name}</div>

                            <div className='font-bold'>Mã lớp: </div>
                            <div>{student.class}</div>

                            <div className='col-span-2'></div>

                            <div className='font-bold'>Giới tính: </div>
                            <div>{student.sex}</div>

                            <div className='font-bold'>Ngày sinh: </div>
                            <div>{formatDate(student.date)}</div>

                            <div className='font-bold'>Email: </div>
                            <div className='col-span-2'>{student.email}</div>
                        </div>
                        {/* </div> */}
                    </div>
                    <div className="rounded-lg border-2 border-black items-center" style={{ height: '300px' }} >
                        <h1 className="infor-user justify-center">Thông tin bằng cấp</h1>
                        <table className='table-degree mx-auto text-left    '>
                            <tbody className=''>
                                <tr>
                                    <td>Loại bằng</td>
                                    <td>{infor.type}</td>
                                </tr>
                                <tr>
                                    <td>Ngành đào tạo</td>
                                    <td className='flex' style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        <span className=''>
                                            {infor.major}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Hình thức đào tạo</td>
                                    <td>{infor.training}</td>
                                </tr>
                                <tr>
                                    <td>Số hiệu</td>
                                    <td className='overflow-hidden'>{infor.number}</td>
                                </tr>
                                <tr>
                                    <td>Số vào sổ cấp bằng</td>
                                    <td className='overflow-hidden'>{infor.inputbook}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="gap-5 m-5 ">
                    <h1 className='text-[20px] text-center'><strong>Kết quả học tập</strong></h1>
                    <div className='table-content my-4 mx-auto'>
                        {academicYears.map((academicYear) => (
                            <div key={academicYear}>
                                {Object.keys(groupedResults[academicYear]).map((semester) => (
                                    <div key={semester}>
                                        <h5 className='border mx-auto py-0.5 pb-0'>
                                            Năm học: {academicYear}, Học kỳ: {semester}
                                        </h5>
                                        <table className='border my-0 mx-auto table-score py-0'>
                                            <thead>
                                                <tr>
                                                    <th className='w-[20px]'>STT</th>
                                                    <th className='w-[80px]'>Mã HP</th>
                                                    <th className='w-auto'>Tên HP</th>
                                                    <th className='w-[80px]'>Mã lớp HP</th>
                                                    <th className='w-[80px]'>Tín chỉ</th>
                                                    <th className='w-[80px]'>Điểm số</th>
                                                    <th className='w-[80px]'>Điểm chữ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupedResults && groupedResults[academicYear][semester].map((result, index) => {
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
                                                        <tr key={index} className={result.confirm == false && hasPermissionError == false ? 'text-red-500' :
                                                            (result.score == undefined && result.confirm != undefined && compare && hasPermissionError == false ? 'text-blue-500' : '')}>
                                                            <td>{index + 1}</td>
                                                            <td>{result.subjectMS}</td>
                                                            <td className='text-left'>{result.subjectTen}</td>
                                                            <td className='text-left'>{result.groupMa}</td>
                                                            <td>{result.subjectSotc}</td>
                                                            <td>{result.score}</td>
                                                            <td>{grade}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        <div className='flex flex-row justify-between mx-auto result-total mt-5'>
                                            <div className='text-left'>
                                                Số tín chỉ đã học trong học kỳ: {totalCreditsBySemester[`${academicYear}-${semester}`]}
                                            </div>
                                            <div>
                                                Điểm trung bình học kỳ: {calculateSemesterGPA(groupedResults[academicYear][semester])}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className='flex flex-row justify-between mx-auto result-total mt-5'>
                        <div>
                            Tổng số tín chỉ đã tích lũy: {totalAccumulatedCredits}
                        </div>
                        <div>
                            Điểm trung bình tích lũy: {totalResult}
                        </div>
                    </div>
                    <table className='table_export mt-10'>
                        <tbody>
                            <tr>
                                <td>Ghi chú : </td>
                                <td>+ Kết quả có màu đỏ là kết quả bị lỗi.</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>+ Kết quả có màu xanh dương là kết quả chưa được chấm điểm.</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>+ Bảng điểm lớp học phần chỉ được in khi đã nhập đủ điểm</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="grid grid-cols-4 gap-2 classification" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 3fr' }}>
                        <div>Loại xuất sắc:</div>
                        <div>từ 3.6 đến 4.00</div>

                        <div>Loại khá:</div>
                        <div>từ 2.5 đến 3.19</div>

                        <div>Loại giỏi:</div>
                        <div>từ 3.2 đến 3.59</div>

                        <div>Loại trung bình:</div>
                        <div>từ 2 đến 2.49</div>
                    </div>
                </div>
            </section>
            {showModal ? (
                <>
                    <div
                        className="justify-center grid grid-cols-1 lg:grid-cols-2 items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                    >
                        <div className=' justify-center flex'>
                            {image ? (
                                <img src={image} alt="Image" className='ml-5 shadow-2xl rounded-md' />
                            ) : (
                                <img src={cardLinks.image} alt="please" className='ml-5 shadow-2xl rounded-md h-[480px]' />
                            )}
                        </div>
                        <div className="relative w-auto my-6 mx-auto max-w-3xl ">
                            {/*content*/}
                            <div className="test-bg  border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between px-5 py-2 rounded-t">
                                    <h3 className="text-3xl font-semibold text-center justify-items-center ml-[40px]" >
                                        Xác nhận cấp bằng
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                            ×
                                        </span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="relative mx-10 flex-auto degree_form">
                                    {/* <h1 className='text-center'>Thông tin bằng xét tốt nghiệp</h1> */}
                                    <h1 className='mt-2 uppercase'>BẰNG {infor.type}</h1>
                                    <table className='table-save mx-auto text-left gap-4 p-5 '>
                                        <tbody className=''>
                                            <tr>
                                                <td>Ngành đào tạo</td>
                                                <td className='font-bold'>{infor.major}</td>
                                            </tr>
                                            <tr>
                                                <td>Tên</td>
                                                <td className='font-bold'>{student.name}</td>
                                            </tr>
                                            <tr>
                                                <td>Xếp loại đào tạo</td>
                                                <td className='font-bold'>
                                                    {totalResult >= 3.6 && totalResult <= 4.00 ? 'Xuất sắc ' :
                                                        totalResult >= 3.2 && totalResult <= 3.59 ? 'Giỏi' :
                                                            totalResult >= 2.5 && totalResult < 3.2 ? 'Khá' :
                                                                totalResult > 2 && totalResult < 2.5 ? 'Trung bình' : ''} | {totalResult}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Hình thức đào tạo</td>
                                                <td className='font-bold'>{infor.training}</td>
                                            </tr>
                                            <tr>
                                                <td>Số hiệu</td>
                                                <td className='font-bold'>{infor.number}</td>
                                            </tr>
                                            <tr>
                                                <td>Số vào sổ cấp bằng</td>
                                                <td className='font-bold'>{infor.inputbook}</td>
                                            </tr>
                                            {/* <tr>
                                                <td>
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>

                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-end p-6 mr-10 border-t border-solid border-blueGray-200 rounded-b">
                                    {!isConfirm ? (
                                        <>
                                            <input type='file' name="uploadfile" id='image' className='max-w-[500px]' onChange={convertToBase64} accept="image/*" />

                                            <button
                                                className="bg-emerald-500 text-white active:bg-emerald-600 rounded-lg font-bold uppercase text-sm px-6 py-3 shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                type="button"
                                                onClick={handleClick}
                                            >
                                                Xác nhận
                                            </button>
                                            <button
                                                className="text-white bg-red-500 font-bold uppercase px-6 py-3 rounded-lg text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    ) : (
                                        <LoadingSpinner />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null
            }
        </>
    )
}

export default DegreeVerify

{/* <button
        className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Open regular modal
      </button>
      {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
// {/* <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
//     {/*header*/}
//     <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
//         <h3 className="text-3xl font-semibold">
//             Modal Title
//         </h3>
//         <button
//             className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
//             onClick={() => setShowModal(false)}
//         >
//             <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
//                 ×
//             </span>
//         </button>
//     </div>
//     {/*body*/}
//     <div className="relative p-6 flex-auto">
//         <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
//             I always felt like I could do anything. That’s the main
//             thing people are controlled by! Thoughts- their perception
//             of themselves! They're slowed down by their perception of
//             themselves. If you're taught you can’t do anything, you
//             won’t do anything. I was taught I could do everything.
//         </p>
//     </div>
//     {/*footer*/}
//     <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
//         <button
//             className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
//             type="button"
//             onClick={() => setShowModal(false)}
//         >
//             Close
//         </button>
//         <button
//             className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
//             type="button"
//             onClick={() => setShowModal(false)}
//         >
//             Save Changes
//         </button>
//     </div>
// </div>
//             </div >
//           </div >
//     <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
//         </>
//       ) : null} * /} */}



// tổng tín chỉ đã học
// const [totalAccumulatedCredits, setTotalAccumulatedCredits] = useState(0);
// const calculateTotalAccumulatedCredits = () => {
//     let totalAccumulated = 0;

//     academicYears.forEach((academicYear) => {
//         Object.keys(groupedResults[academicYear]).forEach((semester) => {
//             totalAccumulated += totalCreditsBySemester[`${academicYear}-${semester}`];
//         });
//     });

//     return totalAccumulated;
// };
// useEffect(() => {
//     setTotalAccumulatedCredits(calculateTotalAccumulatedCredits());
// }, [academicYears, totalCreditsBySemester]);

