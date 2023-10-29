import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAxios from '../../hooks/useAxios'
import { BASE_URL } from '../../utils/config'
import { FaEye } from 'react-icons/fa6';

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
      </div>
      {/* <div> */}
        <div className="gap-5 m-5 title_list">
          <h1 className='text-[30px] mt-5'>DANH SÁCH SINH VIÊN</h1>
        </div>
        <table className='table_student mx-auto'>
          <thead>
            <tr className='bg-cyan-300'>
              <th className='w-[40px]'>STT</th>
              <th className='w-[50px] '>Mã lớp</th>
              <th className='w-[80px]'>MSSV</th>
              <th className='w-[150px]'>Họ Tên</th>
              <th className='overflow-hidden'>Email</th>
              <th>Số điện thoại</th>
              <th>Giới tính</th>
              <th>Ngày sinh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students && students.map((student, index) => {
              return (
                <tr key={index}>
                  <td className='text-center'>{index + 1}</td>
                  <td>{student.class}</td>
                  <td className='text-center'>{student.mssv}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.sdt}</td>
                  <td>{student.sex}</td>
                  <td>{formatDate(student.date)}</td>
                  <td >
                    <div className='flex justify-center'>
                      <Link to={`/student/result/${student._id}`}>
                        <FaEye />
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