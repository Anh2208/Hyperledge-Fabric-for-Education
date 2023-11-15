import React, { useState } from 'react';

import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowRotateLeft } from 'react-icons/fa6';


const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('some'); // Một giá trị mặc định
  const [fromYear, setFromYear] = useState('2023');
  const [fromSemester, setFromSemester] = useState('1');
  const [toYear, setToYear] = useState('2023');
  const [toSemester, setToSemester] = useState('1');

  const handleFromYearChange = (e) => {
    setFromYear(e.target.value);
  }
  const handleFromSemesterChange = (e) => {
    setFromSemester(e.target.value);
  }
  const handleToYearChange = (e) => {
    setToYear(e.target.value);
  }
  const handleToSemesterChange = (e) => {
    setToSemester(e.target.value);
  }
  const handleRadioChange = (e) => {
    setSelectedOption(e.target.value);

    if (e.target.value === 'all') {
      // setFromYear('2023');
      // setFromSemester('1');
      // setToYear('2023');
      // setToSemester('2023');
    }
  }

  const handleClickPrint = async (e) => {

    if (fromYear > toYear) {
      alert("Học kỳ chọn chưa đúng!")
    } else if (fromYear == toYear && fromSemester > toSemester) {
      alert("Bạn đang chọn cùng năm học nhưng học kỳ sau lại lớn hơn học kỳ trước!")
    } else {
      const studenrResultLocal = {
        selectedOption,
        fromYear,
        fromSemester,
        toYear,
        toSemester
      }

      localStorage.setItem('printData', JSON.stringify(studenrResultLocal));
      navigate(`/student/result/detail/export`);
    }
  }

  return (
    <section className='px-5 xl:px-0 container pt-5 '>
      {/* <div className="content-header mb-0"> */}
      <div className="max-w-[1170px] mx-auto rounded ">
        <div className="flex flex-row gap-5 m-5">
          <div className='p-1 rounded-md border-2 border-black'>
            <Link to={`/student/result`} className="flex justify-between">
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

      <div className='table-content my-4'>
        <h6 className='border mx-auto py-0.5 title-semester'>Thông số in bảng điểm cá nhân của sinh viên</h6>
        <table className='border table-semester my-0 mx-auto'>
          <tbody className='py-10'>
            <tr>
              <td colSpan={2}><br /></td>
            </tr>
            <tr>
              <td className='text-center'>In tất cả học kỳ </td>
              <td className='text-left '>
                <input
                  type="radio"
                  value="all"
                  checked={selectedOption === 'all'}
                  onChange={handleRadioChange}
                />
              </td>
            </tr>
            <tr>
              <td className='text-center'>In tất cả học kỳ </td>
              <td className='text-left'>
                <input
                  type="radio"
                  value="some"
                  checked={selectedOption === 'some'}
                  onChange={handleRadioChange}
                />
              </td>
            </tr>
            <tr>
              <td className='text-right px-5'>
                Từ: Năm học &ensp;
                <select
                  id="fyear"
                  className='border rounded border-b-black max-w-[100px]'
                  disabled={selectedOption === 'all'}
                  value={fromYear}
                  onChange={handleFromYearChange}
                >
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="all">tất cả</option>
                </select>
              </td>
              <td>
                Học kỳ &ensp;
                <select
                  id="fsemester"
                  className='border rounded border-b-black max-w-[100px]'
                  disabled={selectedOption === 'all'}
                  value={fromSemester}
                  onChange={handleFromSemesterChange}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">hè</option>
                  {/* <option value="all">tất cả</option> */}
                </select>
              </td>
            </tr>
            <tr>
              <td className='text-right px-5'>
                Đến: Năm học &ensp;
                <select
                  id="tyear"
                  className='border rounded border-b-black max-w-[100px]'
                  disabled={selectedOption === 'all'}
                  value={toYear}
                  onChange={handleToYearChange}
                >
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="all">tất cả</option>
                </select>
              </td>
              <td>
                Học kỳ &ensp;
                <select
                  id="tsemester"
                  className='border rounded border-b-black max-w-[100px]'
                  disabled={selectedOption === 'all'}
                  value={toSemester}
                  onChange={handleToSemesterChange}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">hè</option>
                  {/* <option value="all">tất cả</option> */}
                </select>
              </td>
            </tr>
            <tr className=''>
              <td className='pt-10 print-score' colSpan={2}>
                <div className='flex flex-row p-2'>
                  {/* <Link to={`/student/semester/print/${id}`}> */}
                  <button onClick={handleClickPrint} className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                    In Điểm
                  </button>
                  {/* </Link> */}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default StudentDetails;

// export default StudentDetails;
