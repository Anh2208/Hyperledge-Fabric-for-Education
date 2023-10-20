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
        }else{
            setApiEndpoint(`${BASE_URL}admin/getAllAdmin`);
        }
    }, [selectedRole]);

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
                    <header className='card-header w-full mb-8'>
                        <div className='row gx-3'>
                            <div className='col-lg-4 col-md-4 mb-4 me-auto'>
                                <input type="text" placeholder='Nhập mã số cần tìm' className='form-control' />
                                {/* <h1>dsadas</h1> */}
                            </div>
                            <div className='col-lg-2 col-1 col-md-3'>
                                <select className='form-select' value={selectedRole} onChange={(e) => setselectedRole(e.target.value)} >
                                    <option value="admin">Admin</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        </div>
                    </header>

                    {/* Card body */}
                    {selectedRole === "student" ? (
                        <div className='card-body'>
                            <Table striped bordered hover size="sm" className='w-full'>
                                <thead>
                                    <tr className='text-left'>
                                        <th>Mã số</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Sex</th>
                                        <th>publicKey</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user, index) => {
                                        return (
                                            <tr key={user._id || index}>
                                                <td>{user.mssv}</td>
                                                <td>{user.email}</td>
                                                <td>{user.name}</td>
                                                <td>{user.sex}</td>
                                                <td className='truncate'>{user.publicKey}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    ) : selectedRole === "teacher" ? (
                        <div className='card-body'>
                            <Table striped bordered hover size="sm" className='w-full'>
                                <thead>
                                    <tr className='text-left'>
                                        <th>Mã số</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Sex</th>
                                        <th>publicKey</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user, index) => {
                                        return (
                                            <tr key={user._id || index}>
                                                <td>{user.msgv}</td>
                                                <td>{user.email}</td>
                                                <td>{user.name}</td>
                                                <td>{user.sex}</td>
                                                <td className='truncate'>{user.publicKey}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className='card-body'>
                            <Table striped bordered hover size="sm" className='w-full'>
                                <thead>
                                    <tr className='text-left'>
                                        <th>Mã số</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Ngày sinh</th>
                                        <th>SDT</th>
                                        <th>publicKey</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user, index) => {
                                        return (
                                            <tr key={user._id || index}>
                                                <td>{user.adminMS}</td>
                                                <td>{user.email}</td>
                                                <td>{user.name}</td>
                                                <td>{user.date}</td>
                                                <td>{user.sdt}</td>
                                                <td className='truncate'>{user.publicKey}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default UserComponent