import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAxios from '../../hooks/useAxios'
import { BASE_URL } from '../../utils/config'
import { FaEye, FaTablet } from 'react-icons/fa6';
import './student.css'

const StudentResult = () => {

  const [student, setStudent] = useState(`${BASE_URL}admin/getAllStudent`);
  const { data: students, loadin, error } = useAxios(student);
  console.log("all student is:", students);


  function formatDate(dateString) {// Định dạng ngày
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  }

  return (
    <section className='content-main'>
      <div className="content-header">
        <h2 className="content-title">Kết quả học tập</h2>
        <div className='rounded-md flex flex-row gap-5'>
          <Link to={`/student/editscore`}>
            <button className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
              Quyền sửa điểm
            </button>
          </Link>
          <Link to={`/student/result/check`}>
            <button className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
              Truy vấn điểm
            </button>
          </Link>
        </div>
      </div>
      {/* <div> */}
      <div className="gap-5 m-5 title_list">
        <h1 className='text-[30px] mt-5'>DANH SÁCH SINH VIÊN</h1>
      </div>
      <table className='table-result mx-auto border-separate border border-slate-400 '>
        <thead>
          <tr className='bg-cyan-300'>
            <th className='max-w-[20px]'>STT</th>
            <th className='max-w-[40px]'>Mã lớp</th>
            <th className='max-w-[40px]'>MSSV</th>
            <th className='w-[150px]'>Họ Tên</th>
            <th className='overflow-hidden'>Email</th>
            <th className='max-w-[50px] overflow-hidden'>Số điện thoại</th>
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
                <td className='max-w-[50px] overflow-hidden text-left'>{student.sdt}</td>
                <td className='text-left'>{student.sex}</td>
                <td>{formatDate(student.date)}</td>
                <td >
                  <div className='flex justify-center tooltip'>
                    <Link to={`/student/result/${student._id}`}>
                      <FaEye />
                      <span className="tooltiptext">Xem bảng điểm</span>
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {/* </div> */}
    </section>
  )
}

export default StudentResult