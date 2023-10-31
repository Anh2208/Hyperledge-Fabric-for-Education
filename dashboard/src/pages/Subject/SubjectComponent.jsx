import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearchengin } from "react-icons/fa6";
import useAxios from '../../hooks/useAxios';
import Table from "react-bootstrap/Table";
import { BASE_URL } from '../../utils/config';
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import "./subject.css"

const SubjectComponent = () => {

    const [searchText, setSearchText] = useState(''); // Trạng thái cho mã tìm kiếm
    const [subject, setSubject] = useState(`${BASE_URL}subject/`);
    const { data: subjects, loading, error } = useAxios(subject);

    // Sử dụng useEffect để theo dõi sự thay đổi của data và thực hiện tác vụ sau khi dữ liệu đã được tải
    useEffect(() => {
        if (subjects) {
            console.log("Dữ liệu học phần đã được tải:", subjects);
        }
    }, [subjects]); // Đặt subjects là dependency để useEffect theo dõi sự thay đổi của nó.

    const deletehandler = (id) => {
        try {
            if (window.confirm("Bạn có thực sự muốn xóa???")) {
                const axiosInstance = axios.create({
                    withCredentials: true
                });
                const response = axiosInstance.delete(`${BASE_URL}subject/${id}`);
                // toast.success('Xóa tour thành công');
                toast.success('Xóa học phần thành công', {
                    onClose: () => {
                        setTimeout(() => {
                            window.location.reload(); // Reload trang sau khi Toast đã đóng
                        }, 2000); // Đợi 1 giây trước khi reload trang
                    },
                });
            }
        } catch (err) {
            toast.error(err, {
                autoClose: 2000,
                style: {
                    backgroundColor: 'red'
                }
            });
        }
    };

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
            <section className='content-main'>
                <div className='content-header'>
                    <h1 className='content-title'>Học phần</h1>
                    <div>
                        <Link to={"/subject/add"} className='btn btn-primary'>
                            <i className='material-icons md-plus'></i>Thêm Học phần
                        </Link>
                    </div>
                </div>
                <div className='card mb-4'>
                    <header className='card-header mb-8 justify-end flex'>
                        <div className='row gx-3 '>
                            <div className='col-lg-4 col-md-4 m-4 p-2 me-auto border border-black rounded-md'>
                                <input
                                    type="text"
                                    placeholder='Tìm kiếm học phần...'
                                    className='form-control'
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                {/* <button className=''><FaSearchengin /></button> */}
                            </div>
                        </div>
                    </header>
                    <div className='card-body justify-center flex'>
                        {loading && <h4 className="text-center pt-5">Loading.....</h4>}
                        {error && <h4 className="text-center pt-5">{error}</h4>}
                        {!loading && !error && (

                            <table size="sm" className='table-subject border-separate border border-slate-400 '>
                                <thead>
                                    <tr className='text-center'>
                                        <th>STT</th>
                                        <th>Mã học phần</th>
                                        <th>Tên học phần</th>
                                        <th>Số tín chỉ</th>
                                        <th className='hanh-dong' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects
                                        ?.filter((subject) => {
                                            // Áp dụng tìm kiếm không phân biệt hoa thường
                                            const subjectMaLowerCase = subject.subjectMa.toLowerCase();
                                            const searchTextLowercase = searchText.toLowerCase();
                                            return subjectMaLowerCase.includes(searchTextLowercase);
                                        })
                                        .map((subject, index) => {
                                            return (
                                                <tr key={subject._id || index}>
                                                    <td>{index + 1}</td>
                                                    <td>{subject.subjectMa}</td>
                                                    <td className='text-left'>{subject.subjectTen}</td>
                                                    <td className='text-center'>{subject.subjectSotc}</td>
                                                    <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Link
                                                            to={`/subject/edit/${subject._id}`}
                                                            className="rounded-full bg-green-200 py-[3px] px-3 text-xs text-green-900 transition-all hover:bg-green-100"
                                                        >
                                                            Sửa
                                                        </Link>
                                                        <button
                                                            className="ml-3 rounded-full bg-orange-200 py-[3px] px-3 text-xs 
                                                            text-orange-900 transition-all hover:bg-orange-100"
                                                            onClick={() => deletehandler(subject._id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default SubjectComponent;
