import React, { useContext } from "react"
import QLDiem from "../../asset/images/ql_diem.gif"
import { Link } from 'react-router-dom'
import { AuthContext } from "../../context/AuthContext"

const TeacherHome = () => {

    const { user } = useContext(AuthContext);

    return (
        <>
            <section className="px-5 xl:px-0 container pt-5">
                <div className="max-w-[1170px] mx-auto rounded  border-2 border-black">
                    <div className="grid grid-cols-1 lg:grid-cols-2 p-5 gap-5">
                        {/* =============image box============= */}
                        <div className=" rounded-lg border-2 border-primaryColor items-center">
                            <div>
                                <h1 className="infor justify-center mb-3">Thông tin Giảng viên</h1>
                                <div className="grid grid-cols-2 gap-4 p-10 mx-20">
                                    <div className='font-bold'>Mã GV: </div>
                                    <div>{user.msgv}</div>

                                    <div className='font-bold' >Họ tên: </div>
                                    <div>{user.name}</div>

                                    <div className='font-bold'>Giới tính: </div>
                                    <div>
                                        {user.sex === 'male' ? (
                                            `Nam`
                                        ) : (
                                            `Nữ`
                                        )}
                                    </div>

                                    <div className='font-bold'>Email: </div>
                                    <div>{user.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* =============login form============= */}
                        <div className="rounded-lg border-2 border-primaryColor p-5 flex items-center justify-center">
                            <div className="gap-8 columns-1">
                                {/* <img className="aspect-video max-w-xs" src={QLDiem} /> */}
                                <div className="rounded overflow-hidden shadow-lg card-item">
                                    <Link><img src={QLDiem} alt="" /></Link>
                                    <div className="px-6 py-4">
                                        {/* <button className="font-bold text-xl mb-2 text-center">Quản lý điểm</button> */}
                                        <Link to={"/teacher/score"} className="font-bold text-xl mb-2 text-center" >Quản lý điểm</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default TeacherHome