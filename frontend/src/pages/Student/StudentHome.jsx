import React, { useContext } from "react";
import { Link } from 'react-router-dom'
import Score from "../../asset/images/ql_diem.gif"
import Degree from "../../asset/images/degree.png"
import { AuthContext } from "../../context/AuthContext"

const StudentHome = () => {

  const { user } = useContext(AuthContext);
  console.log("dasdsad", user);
  const cardLinks = [
    {
      name: "Kết quả học tập",
      href: "/student/result",
      image: Score,
    },
    {
      name: "Bằng cấp",
      href: "/student/degree",
      image: Degree,
    },
  ];

  return (
    <>
      <section className="px-5 xl:px-0 container pt-5">
        <div className="max-w-[1170px] mx-auto rounded  border-2 border-black">
          <div className="grid grid-cols-1 lg:grid-cols-2 p-5 gap-5">
            {/* =============image box============= */}
            <div className=" rounded-lg border-2 border-primaryColor items-center">
              <div>
                <h1 className="infor justify-center mb-3">Thông tin Sinh viên</h1>
                <div className="grid grid-cols-2 gap-4 p-10 mx-20">
                  <div className='font-bold'>Mã GV: </div>
                  <div>{user.mssv}</div>

                  <div className='font-bold' >Họ tên: </div>
                  <div>{user.name}</div>

                  <div className='font-bold'>Giới tính: </div>
                  <div>{user.sex} </div>

                  <div className='font-bold'>Email: </div>
                  <div>{user.email}</div>
                </div>

              </div>
            </div>
            <div className="rounded-lg border-2 border-primaryColor p-5 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-5 px-5">

                {cardLinks.map((item, index) => {
                  return (
                    <div className="rounded overflow-hidden shadow-lg card-item" key={index} >
                      <Link to={item.href} ><img src={item.image} alt="" className='p-10' /></Link>
                      <div className="px-6 py-4  card-home">
                        {/* <button className="font-bold text-xl mb-2 text-center">Quản lý điểm</button> */}
                        <Link to={item.href} className="font-bold text-xl mb-2 text-[1rem]" >{item.name}</Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
};

export default StudentHome;
