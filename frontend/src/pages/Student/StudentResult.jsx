import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { BASE_URL } from '../../utils/config';
import { AuthContext } from '../../context/AuthContext';
import "./student.css"
import axios from 'axios';

const StudentResult = () => {

    const { user } = useContext(AuthContext);
    const [result, setResult] = useState([]);

    const [currentYear, setCurrentYear] = useState("2023");
    const [currentSemester, setCurrentSemester] = useState("1");
    const [selectedYear, setSelectedYear] = useState("2023");
    const [selectedSemester, setSelectedSemester] = useState("1");
    const [filteredResults, setFilteredResults] = useState({});

    const fetchData = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.get(`${BASE_URL}result/search/mongodb/getResultByMSSV`, {
                params: { studentMS: user.mssv },
            });

            setResult(response.data.data);
        } catch (err) {
            console.log("Lỗi hiển thị kết quả học tập: ", err);
        }
    }
    console.log("response", result);
    const handleChangeYear = (e) => {
        setCurrentYear(e.target.value); // Set currentYear
    }
    const handleChangeSemester = (e) => {
        setCurrentSemester(e.target.value); // Set currentSemester
    }
    const handleClick = (e) => {
        console.log("currentYear is ", currentYear);
        console.log("currentSemester is ", currentSemester);
        setSelectedYear(currentYear);
        setSelectedSemester(currentSemester);
    }

    useEffect(() => {
        fetchData();
    }, [])

    // useEffect(() => {
    //     // Filter results based on selected year and semester
    //     const filteredData = result.reduce((acc, curr) => {
    //         if (selectedYear === "all" || curr.date_awarded.startsWith(selectedYear)) {
    //             const key = curr.date_awarded + "-" + curr.semester;
    //             console.log("dsadsad", curr.semester);
    //             if (!acc[key]) {
    //                 acc[key] = [];
    //             }
    //             // if(curr.semester != selectedSemester){
    //             //     acc[key] = [];
    //             // }
    //             acc[key].push(curr);
    //         }
    //         return acc;
    //     }, {});
    //     setFilteredResults(filteredData);
    // }, [result, selectedYear, selectedSemester]);
    useEffect(() => {
        // Filter results based on selected year and semester
        const filteredData = result.reduce((acc, curr) => {
            if (
                (selectedYear === "all" || curr.date_awarded.startsWith(selectedYear)) &&
                (selectedSemester === "all" || curr.semester == selectedSemester)
            ) {
                const key = curr.date_awarded + "-" + curr.semester;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(curr);
            }
            return acc;
        }, {});
        setFilteredResults(filteredData);
    }, [result, selectedYear, selectedSemester]);
    
    return (
        <>
            <section className="px-5 xl:px-0 container pt-5">
                <div className="max-w-[1170px] mx-auto rounded border-2 border-black">
                    <div className="flex flex-row gap-5 m-5">
                        <div className='p-1 rounded-md border-2 border-black'>
                            <Link to={"/teacher"} className="flex justify-between">
                                <span className='items-center gap-3 rounded-md px-1 py-2'>
                                    <FaArrowRotateLeft />
                                </span>
                                <span className='hidden text-base font-semibold xl:block p-1'>
                                    Quay lại
                                </span>
                            </Link>
                        </div>
                        <div className=' bg-cyan-200 rounded-md'>
                            <Link to="/">
                                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                                    Export Điểm
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="gap-5 m-5 title_list">
                        <h1>Kết quả học tập</h1>
                        <div className='flex flex-row justify-center gap-3'>
                            {/* lọc theo năm học */}
                            <div className="flex items-center">
                                <a>Năm học: </a>
                            </div>
                            <div>
                                <select id="year" value={currentYear} onChange={handleChangeYear} className='border rounded border-b-black max-w-[100px]'>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                    <option value="2020">2020</option>
                                    <option value="2019">2019</option>
                                    <option value="all">tất cả</option>
                                </select>
                            </div>
                            {/* lấy giá trị học kì */}
                            <div className="flex items-center">
                                <a>Học kỳ: </a>
                            </div>
                            <div>
                                <select id="semester" value={currentSemester} onChange={handleChangeSemester} className='border rounded border-b-black max-w-[100px]'>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">hè</option>
                                    <option value="all">tất cả</option>
                                </select>
                            </div>

                            <button onClick={handleClick} className='text-white text-[0.75rem] bg-primaryColor px-2 py-1 rounded'>Liệt kê</button>
                        </div>
                    </div>
                    <div className='table-content my-4'>
                        <h5>Xem điểm học kỳ</h5>

                        {Object.keys(filteredResults).map((yearSemester, index) => {
                            const [year, semester] = yearSemester.split("-");
                            return (
                                <div className='mb-5' key={index}>
                                    <h6 className='border mx-auto py-0.5'>Năm học: {year}, Học kỳ: {semester}</h6>
                                    <table className='border table-score my-0 mx-auto'>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã HP</th>
                                                <th>Tên HP</th>
                                                <th>Tín chỉ</th>
                                                <th>Điểm chữ</th>
                                                <th>Điểm số</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResults[yearSemester].map((item, i) => (
                                                <tr key={i}>
                                                    <td>{i + 1}</td>
                                                    <td>{item.subjectMS}</td>
                                                    <td>{item.subjectTen}</td>
                                                    <td>{item.subjectSotc}</td>
                                                    <td>{item.score}</td>
                                                    <td>Rỗng</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    )
}

export default StudentResult