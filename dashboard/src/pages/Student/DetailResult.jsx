import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BASE_URL } from '../../utils/config';
import axios from 'axios';
import useAxios from '../../hooks/useAxios';
const DetailResult = () => {

    const { id } = useParams();
    const [result, setResult] = useState([]);

    const [currentYear, setCurrentYear] = useState("2023");
    const [currentSemester, setCurrentSemester] = useState("1");
    const [selectedYear, setSelectedYear] = useState("2023");
    const [selectedSemester, setSelectedSemester] = useState("1");
    const [filteredResults, setFilteredResults] = useState({});

    const [url, setURL] = useState(`${BASE_URL}auth/getStudentByID/${id}`);
    const { data: student, loading, error } = useAxios(url);

    const fetchData = async () => {
        try {
            const axiosInstance = axios.create({
                withCredentials: true
            });
            const response = await axiosInstance.get(`${BASE_URL}result/search/mongodb/getResultByStudentID`, {
                params: { id: id },
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
            <section className='content-main'>
                <div className="content-header">
                    <h2 className="content-title">Điểm lớp học phần</h2>
                    <div className=' bg-cyan-200 rounded-md'>
                        <Link to={`/student/semester/${student._id}`}>
                            <button className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                                In Điểm
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="gap-5 m-5 title_list">
                    <h1 className='text-[20px]'><strong>Kết quả học tập</strong></h1>
                    <div className='flex'>
                        <h1><strong>Sinh Viên:</strong> {student.name}</h1> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                        <h1> <strong>MSSV:</strong> &nbsp; {student.mssv}</h1>
                    </div>
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

                    {Object.keys(filteredResults).map((yearSemester, index) => {
                        const [year, semester] = yearSemester.split("-");
                        return (
                            <div className='mb-5' key={index}>
                                <h5 className='border mx-auto py-0.5 pb-0'>Năm học: {year}, Học kỳ: {semester}</h5>
                                <table className='border my-0 mx-auto table-result'>
                                    <thead>
                                        <tr>
                                            <th className='w-10px'>STT</th>
                                            <th className='text-left'>Mã HP</th>
                                            <th className='text-left'>Tên HP</th>
                                            <th>Tín chỉ</th>
                                            <th>Điểm chữ</th>
                                            <th>Điểm số</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredResults[yearSemester].map((item, i) => (
                                            <tr key={i}>
                                                <td className='text-center'>{i + 1}</td>
                                                <td>{item.subjectMS}</td>
                                                <td>{item.subjectTen}</td>
                                                <td className='text-center'>{item.subjectSotc}</td>
                                                <td className='text-center'>{item.score}</td>
                                                <td className='text-center'>Rỗng</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    )
}

export default DetailResult