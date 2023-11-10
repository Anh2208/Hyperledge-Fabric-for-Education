import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { BASE_URL } from '../../utils/config';
import useAxios from '../../hooks/useAxios';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';
import ReactToPrint from "react-to-print"; // Import ReactToPrint


const PrintResult = () => {

    const { id } = useParams();
    const [check, setCheck] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);// tạo trạng thái loading khi nhấn nút "Lưu"
    const [userURL, setUserURL] = useState(`${BASE_URL}auth/getStudentByID/${id}`)
    const { data: student, loading, error } = useAxios(userURL);
    const [selectedOption, setSelectedOption] = useState(''); // Một giá trị mặc định
    const [fromYear, setFromYear] = useState('');
    const [fromSemester, setFromSemester] = useState('');
    const [toYear, setToYear] = useState('');
    const [toSemester, setToSemester] = useState('');
    const [results, setResults] = useState([]);
    const [compare, setCompare] = useState(false);
    const [hasPermissionError, setHasPermissionError] = useState(false);
    const [errResult, setErrResult] = useState([]);
    const componentRef = React.useRef();

    const fetchData = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            const response = await axiosInstance.get(
                `${BASE_URL}result/search/mongodb/getResultByStudentID`,
                {
                    params: { id: id },
                }
            );
            if (selectedOption == 'all') {
                setResults(response.data.data);
            } else {
                // Lọc kết quả ngay khi nhận được dữ liệu
                const filteredResults = await filterResults(response.data.data);
                setResults(filteredResults);
                // console.log("tes tpw ddasd", response.data.data);
            }
        } catch (err) {
            console.log("Lỗi lấy dữ liệu:", err);
        }
    };

    useEffect(() => {
        // Gán giá trị từ localStorage
        const saveLocal = localStorage.getItem('printData');
        if (saveLocal) {
            const data = JSON.parse(saveLocal);
            setFromYear(data.fromYear);
            setFromSemester(data.fromSemester);
            setToYear(data.toYear);
            setToSemester(data.toSemester);
            setSelectedOption(data.selectedOption);
        }

        fetchData();
    }, [selectedOption]);
    // const test = localStorage.getItem('printData');
    // console.log("PrintData is o", test);
    // Hàm để lọc kết quả theo năm học và học kỳ
    const filterResults = (data) => {
        return data.filter((result) => {
            const resultYear = result.date_awarded;
            const resultSemester = result.semester;

            return (
                (resultYear > fromYear && resultYear < toYear) ||
                (resultYear == fromYear && resultYear <= toYear && resultSemester >= fromSemester && resultSemester <= toSemester) ||
                (resultYear >= fromYear && resultYear == toYear && resultSemester >= fromSemester && resultSemester <= toSemester) ||
                (resultYear == fromYear && resultYear == toYear && resultSemester >= toSemester && resultSemester <= fromSemester)
            );
        });
    };

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    const groupedResults = {}
    results.forEach((result) => {
        const academicYear = result.date_awarded;
        const semester = result.semester;
        if (!groupedResults[academicYear]) {
            groupedResults[academicYear] = {}
        }
        if (!groupedResults[academicYear][semester]) {
            groupedResults[academicYear][semester] = [];
        }
        groupedResults[academicYear][semester].push(result);

    })

    const academicYears = Object.keys(groupedResults).sort();

    const handleClickCheck = async () => {
        setIsConfirm(true);
        let checkhasPermissionError = false;
        try {
            const checkResult = await Promise.all(results.map(async (result) => {
                try {
                    const axiosInstance = axios.create({
                        withCredentials: true,
                    })
                    const response = await axiosInstance.post(`${BASE_URL}result/check/checkResult/${result._id}`);
                    console.log("respoidsada", response);
                    const isConfirmed = response.data.result;
                    if (response.data.scoreBlock != undefined) {
                        return { ...result, confirm: isConfirmed, scoreBlock: response.data.scoreBlock };
                    } else {
                        return { ...result, confirm: isConfirmed };
                    }

                } catch (err) {
                    if (err.response.data.message.includes('Không có quyền kiểm tra và in điểm')) {
                        throw new Error("Không có quyền kiểm tra và in điểm!!");
                    }
                    console.log(err);
                    // if (result.score && err.message.includes("Kết quả không tồn tại")) {
                    //     console.log("result.score", result.score);
                    //     return ({ ...result, confirm: true });
                    // }
                    //  else {
                    //     throw new Error("Lỗi truy vấn");
                    // }
                }
            }));
            console.log("checkResult", checkResult);
            const isConfirmed = checkResult.every((result) => result.confirm);
            const unconfirmedResults = checkResult.filter((result) => result.confirm === false);
            setResults(checkResult);
            setCheck(isConfirmed);
            setIsConfirm(false);
            setErrResult(unconfirmedResults)

            if (checkhasPermissionError) {

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
            console.log("lỗi kiểm tra kết quả", err);
            toast.error(err.message, {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
        setIsConfirm(false);
        setCompare(true);
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
                            <Link to={`/student/semester/${id}`} className="flex justify-between">
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
                <div className="gap-5 m-5 " ref={componentRef}>
                    <h1 className='text-[1rem]'>Đại học Cần Thơ</h1>
                    <h1 className='text-[1rem]'>Bảng ghi điểm học kỳ</h1>
                    <table className='table_export'>
                        <tbody className=''>
                            <tr>
                                <td className='column_left'>Họ Tên</td>
                                <td className='column_right'>
                                    <strong>{student.name} </strong>
                                    <font>
                                        - &nbsp; Mã số : <strong>{student.mssv}</strong>
                                    </font>
                                </td>
                            </tr>
                            <tr>
                                <td className='column_left'>Ngày sinh </td>
                                <td className='column_left'>{formatDate(student.date)}</td>
                            </tr>
                            <tr>
                                <td className='column_left'>Mã lớp</td>
                                <td className='column_left'>{student.class}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>{student.email}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    {academicYears.map((academicYear) => (
                        <div key={academicYear}>
                            {Object.keys(groupedResults[academicYear]).map((semester) => (
                                <div key={semester}>
                                    <h5 className='mt-10'>Năm học : {academicYear}, Học kỳ : {semester}</h5>
                                    <table className='table_export text-left'>
                                        <thead>
                                            <tr>
                                                <th className='w-[50px] text-center'>STT</th>
                                                <th className='w-[70px]'>Mã HP</th>
                                                <th className='w-[150px]'>Tên HP</th>
                                                <th className='w-[50px]'>Nhóm</th>
                                                <th className='w-[70px] text-center'>Số tín chỉ</th>
                                                <th className='w-[70px] text-center'>Điểm số</th>
                                                <th className='w-[70px] text-center'>Điểm chữ</th>
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
                                                    <tr key={index} className={result.score != undefined && result.confirm == false && hasPermissionError == false ? 'text-red-500' :
                                                        (result.score == undefined && result.confirm == true && compare && hasPermissionError == false ? 'text-blue-500' : '')}>
                                                        <td className=' text-center'>{index + 1}</td>
                                                        <td>{result.subjectMS}</td>
                                                        <td>{result.subjectTen}</td>
                                                        <td>{result.groupMa}</td>
                                                        <td className='text-center'>{result.subjectSotc}</td>
                                                        <td className='text-center'>{result.score || ""}</td>
                                                        <td className='text-center'>{grade}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    ))}
                    <table className='table_export mt-5'>
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
                </div>
                <div>
                    {Array.isArray(errResult) && errResult.length > 0 ? (
                        <table className='w-[80%] text-center'>
                            <thead>
                                <tr>
                                    <th className='w-[50px]'>STT</th>
                                    <th className='w-[70px]'>Mã HP</th>
                                    <th className='w-[150px]'>Tên HP</th>
                                    <th className='w-[50px]'>Nhóm</th>
                                    <th className='w-[70px]'>Số tín chỉ</th>
                                    <th className='w-[100px]'>Điểm mongodb</th>
                                    <th className='w-[100px]'>Điểm blockchain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errResult.map((result, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{result.subjectMS}</td>
                                        <td className='text-left'>{result.subjectTen}</td>
                                        <td>{result.groupMa}</td>
                                        <td>{result.subjectSotc}</td>
                                        <td>{result.score || 'null'}</td>
                                        <td>{result.scoreBlock || 'null'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        null

                    )}
                </div>
            </section>
        </>
    )
}

export default PrintResult