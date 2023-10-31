import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BASE_URL } from "../../utils/config.js"
import useAxios from "../../hooks/useAxios.js"
import Table from "react-bootstrap/Table";

const UserComponent = () => {

    const [selectedRole, setselectedRole] = useState("admin");
    const [apiEndpoint, setApiEndpoint] = useState(`${BASE_URL}admin/getAllAdmin`); // Đường dẫn mặc định

    const {
        data: users,
        loading,
        error,
    } = useAxios(apiEndpoint);

    useEffect(() => {
        // Cập nhật đường dẫn dựa trên selectedRole
        if (selectedRole === "student") {
            setApiEndpoint(`${BASE_URL}admin/getAllStudent`);
        } else if (selectedRole === "teacher") {
            setApiEndpoint(`${BASE_URL}admin/getAllTeacher`);
        } else {
            setApiEndpoint(`${BASE_URL}admin/getAllAdmin`);
        }
    }, [selectedRole]);

    function formatDate(dateString) {// Định dạng ngày
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }


    return (
        <>
            <section className='content-main'>
                <div className='content-header'>
                    <h2 className='content-title'>Người dùng</h2>
                    <div>
                        <Link to={"/user/adduser"} className='btn btn-primary'>
                            <i className='material-icons md-plus'></i>Thêm người dùng
                        </Link>
                    </div>
                </div>

                <div className='card mb-4'>
                    <header className='card-header w-full mb-8 flex justify-between'>
                        {/* <div className='row gx-3'> */}
                        <div className='col-lg-2 col-1 col-md-3'>
                            <select className='form-select border border-black p-2 rounded-md' value={selectedRole} onChange={(e) => setselectedRole(e.target.value)} >
                                <option value="admin">Quản trị viên</option>
                                <option value="teacher">Giảng viên</option>
                                <option value="student">Sinh viên</option>
                            </select>
                        </div>
                        <div className=' m-4 p-2 border border-black rounded-md'>
                            <input type="text" placeholder='Nhập mã số cần tìm' className='form-control' />
                            {/* <h1>dsadas</h1> */}
                        </div>
                        {/* </div> */}
                    </header>

                    {/* Card body */}
                    {loading && <h4 className='text-center p-5'>Loading...</h4>}
                    {error && <h4 className='text-center p-5'>{error}</h4>}
                    {!loading && !error && (
                        <>
                            {selectedRole === "student" ? (
                                <div className='card-body justify-center'>
                                    <h1 className='justify-center text-center text-[30px] mb-3'>Sinh viên</h1>
                                    <table size="sm" className='table-user border-separate border border-slate-400 '>
                                        <thead>
                                            <tr>
                                                <th>Mã lớp</th>
                                                <th>Mã số sinh viên</th>
                                                <th>Tên</th>
                                                <th>Email</th>
                                                <th>Số điện thoại</th>
                                                <th>Ngày sinh</th>
                                                <th>Giới tính</th>
                                                {/* <th>publicKey</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users?.map((user, index) => {
                                                return (
                                                    <tr key={user._id || index}>
                                                        <td>{user.class}</td>
                                                        <td>{user.mssv}</td>
                                                        <td className='text-left'>{user.name}</td>
                                                        <td className='text-left'>{user.email}</td>
                                                        <td>{user.sdt}</td>
                                                        <td>{formatDate(user.date)}</td>
                                                        <td>{user.sex}</td>
                                                        {/* <td className='truncate'>{user.publicKey}</td> */}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : selectedRole === "teacher" ? (
                                <div className='card-body'>
                                    <h1 className='justify-center text-center text-[30px] mb-3'>Giảng viên</h1>
                                    <table size="sm" className='table-user border-separate border border-slate-400 '>
                                        <thead>
                                            <tr>
                                                <th>Mã số</th>
                                                <th>Email</th>
                                                <th>Tên</th>
                                                <th>Giới tính</th>
                                                <th className='text__table'>publicKey</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users?.map((user, index) => {
                                                return (
                                                    <tr key={user._id || index}>
                                                        <td>{user.msgv}</td>
                                                        <td className='text-left'>{user.email}</td>
                                                        <td className='text-left'>{user.name}</td>
                                                        <td>{user.sex}</td>
                                                        <td className='truncate text__table'>{user.publicKey}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='card-body'>
                                    <h1 className='justify-center text-center text-[30px] mb-3'>Quản trị viên</h1>
                                    <table size="sm" className='table-user  border-separate border border-slate-400 '>
                                        <thead>
                                            <tr className='text-left'>
                                                <th>Mã số</th>
                                                <th>Email</th>
                                                <th>Tên</th>
                                                <th>Ngày sinh</th>
                                                <th>Số điện thoại</th>
                                                {/* <th>publicKey</th> */}
                                                {/* <th style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Hành động</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users?.map((user, index) => {
                                                return (
                                                    <tr key={user._id || index}>
                                                        <td>{user.adminMS}</td>
                                                        <td className='text-left'>{user.email}</td>
                                                        <td className='text-left'>{user.name}</td>
                                                        <td>{user.date}</td>
                                                        <td>{user.sdt}</td>
                                                        {/* <td className='truncate'>{user.publicKey}</td> */}
                                                        {/* <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                            <Link
                                                                to={"/user/edit/" + user._id}
                                                                className="rounded-full bg-green-200 py-[3px] px-3 text-xs text-green-900 transition-all hover:bg-green-100"
                                                            >
                                                                Sửa
                                                            </Link>
                                                        </td> */}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    )
}

export default UserComponent