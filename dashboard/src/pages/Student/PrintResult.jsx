import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { BASE_URL } from '../../utils/config';
import useAxios from '../../hooks/useAxios';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from '../../hooks/LoadingSpinner';

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
                console.log("tes tpw ddasd", response.data.data);

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
        try {
            const checkResult = await Promise.all(results.map(async (result) => {
                // if (result.score == undefined) {
                //     return ({ ...result, confirm: true });
                // } else {
                try {
                    const axiosInstance = axios.create({
                        withCredentials: true,
                    })
                    const response = await axiosInstance.post(`${BASE_URL}result/check/confirmResult/${result._id}`);
                    const isConfirmed = response.data.result;
                    console.log("isConfirmed", isConfirmed);
                    if (isConfirmed == undefined) {
                        return ({ ...result, confirm: true });
                    } else {
                        return ({ ...result, confirm: isConfirmed });
                    }
                } catch (err) {
                    return ({ ...result, confirm: false });
                }
                // }

            }));
            const isConfirmed = checkResult.every((result) => result.confirm);
            setResults(checkResult);
            setCheck(isConfirmed);
            setIsConfirm(false);

            if (isConfirmed) {
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
        }
        setIsConfirm(false);
        setCompare(true);
    }
    // console.log("Result sau khi ktra la", results);
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
                        <button className='flex justify-center rounded-lg bg-primaryColor text-white p-1'>
                            <span className=' text-base font-semibold xl:block px-5 py-1'>
                                In Điểm
                            </span>
                        </button>
                    )}
                </div>
                <div className="gap-5 m-5 ">
                    <h1 className='text-[1rem]'>Đại học Cần Thơ</h1>
                    <h1 className='text-[1rem]'>Bảng ghi điểm học kỳ</h1>
                    <table className='table_export'>
                        <tbody className=''>
                            <tr>
                                <td className='column_left'>Họ Tên</td>
                                <td className='column_right'>
                                    <strong>{student.name} </strong>
                                    <font>
                                        - &nbsp; Mã số : <strong>G1906001</strong>
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
                                                <th className='w-[50px]'>STT</th>
                                                <th className='w-[70px]'>Mã HP</th>
                                                <th className='w-[150px]'>Tên HP</th>
                                                <th className='w-[50px]'>Nhóm</th>
                                                <th className='w-[70px]'>Số tín chỉ</th>
                                                <th className='w-[70px]'>Điểm số</th>
                                                <th className='w-[70px]'>Điểm chữ</th>
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
                                                    <tr key={index} className={result.confirm === false ? 'text-red-500' :
                                                        (result.score == undefined && result.confirm != undefined && compare ? 'text-blue-500' : '')}>
                                                        <td>{index + 1}</td>
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
            </section>
        </>
    )
}

export default PrintResult