import React, { useEffect, useState, useContext } from 'react'

import { AuthContext } from "../../context/AuthContext"
import { Link, useParams } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { BASE_URL } from '../../utils/config';
import useAxios from '../../hooks/useAxios';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
// import LoadingSpinner from '../../hooks/LoadingSpinner';
import ReactToPrint from "react-to-print"; // Import ReactToPrint
const StudentExport = () => {

    const user = useContext(AuthContext);

    const { id } = useState(user.user._id);
    console.log("iddddd", user.user);
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
                    params: { id: user.user._id },
                    role: user.user.role
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
        const studenrResultLocal = localStorage.getItem('printData');
        if (studenrResultLocal) {
            const data = JSON.parse(studenrResultLocal);
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
    console.log("groupedResults", groupedResults);
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
            <section className="px-5 xl:px-0 container pt-5">
                <div className="max-w-[1170px] mx-auto rounded ">
                    <div className="content-header flex justify-between mb-0">
                        <div className="flex flex-row gap-5 m-5">
                            <div className='p-1 rounded-md border-2 border-black'>
                                <Link to={`/student/result/detail/`} className="flex justify-between">
                                    <span className='items-center gap-3 rounded-md px-1 py-2'>
                                        <FaArrowRotateLeft />
                                    </span>
                                    <span className='hidden text-base font-semibold xl:block p-1'>
                                        Quay lại
                                    </span>
                                </Link>
                            </div>
                        </div>
                        <div className='justify-center my-auto px-5'>
                            {academicYears != '' && (
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
                    </div>
                    <div ref={componentRef}>
                        <div className="gap-5 m-5 " >
                            <h1 className='text-[1rem]'>Đại học Cần Thơ</h1>
                            <h1 className='text-[1rem]'>Bảng ghi điểm học kỳ</h1>
                            <table className='table_export p-5 '>
                                <tbody className=''>
                                    <tr>
                                        <td className='column_left'>Họ Tên</td>
                                        <td className='column_right'>
                                            <strong>{user.user.name} </strong>
                                            <font>
                                                - &nbsp; Mã số : <strong>{user.user.mssv}</strong>
                                            </font>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='column_left'>Ngày sinh </td>
                                        <td className='column_left'>{formatDate(user.user.date)}</td>
                                    </tr>
                                    <tr>
                                        <td className='column_left'>Mã lớp</td>
                                        <td className='column_left'>{user.user.class}</td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>{user.user.email}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            {academicYears.map((academicYear) => (
                                <div key={academicYear}>
                                    {Object.keys(groupedResults[academicYear]).map((semester) => (
                                        <div key={semester}>
                                            <h5 className='mt-10 text-left ml-4'>Năm học : {academicYear}, Học kỳ : {semester}</h5>
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
                            <table className='table_export mt-10'>
                                <tbody>
                                    <tr>
                                        <td>Ghi chú : </td>
                                        <td>+ Học phần có dấu * là ...</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>+ Từ học kỳ 1 năm 2007-2008, Trường Đại học Cần Thơ sử dụng thang điểm 4.</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>+ Bảng điểm lớp học phần chỉ được in khi đã nhập đủ điểm</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="grid grid-cols-4 gap-2 classification w-[630px]" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 3fr' }}>
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
                    </div>
                </div>
            </section>
        </>
    )
}

export default StudentExport