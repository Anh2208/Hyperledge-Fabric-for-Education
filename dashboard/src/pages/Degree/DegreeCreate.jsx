import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, FormGroup, Button } from 'reactstrap';
import Degree from "../../asset/images/open-book.png"
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const DegreeCreate = () => {

    const [infor, setInfor] = useState({
        mssv: '',
        type: 'Kỹ sư',
        training: 'Chính quy',
        major: 'An toàn thông tin',
        number: '',
        inputbook: '',
        image: null
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setInfor((prev) => ({ ...prev, [id]: value }));
    }

    const handleClick = async () => {
        try {
            const check = false;
            const axiosInstance = axios.create({
                withCredentials: true,
            });

            const verify = await axiosInstance.get(`${BASE_URL}verify/getList/getVerifyByMSSV`, {
                params: { mssv: infor.mssv }
            });

            console.log("TATATTATAA", verify.data.success);

            // const student = await axiosInstance.get(`${BASE_URL}auth/getStudentByMSSV`, {
            //     params: { mssv: infor.mssv }
            // });
            if (!verify.data.data.state) {
                // alert('Bằng chưa được xác nhận bởi hiệu trưởng!!!');
                toast.error("Bằng chưa được xác nhận bởi hiệu trưởng!!!", {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
            } else if (infor.number == '' || infor.inputbook == '') {
                // alert('Chưa nhập số hiệu hoặc số vào sổ');
                toast.error("Chưa nhập số hiệu hoặc số vào sổ", {
                    autoClose: 2000,
                    style: {
                        background: 'red',
                    }
                });
            } else {
                // alert("Dữ liệu cần cấp bằng hợp lệ");
                navigate(`/degree/create/verify`);
            }
        } catch (e) {
            toast.error(e.response.data.message ? e.response.data.message : "Lỗi kiểm tra thông tin sinh viên cần cấp bằng", {
                autoClose: 2000,
                style: {
                    background: 'red',
                }
            });
        }
    }

    console.log("Infor is ", infor);
    localStorage.setItem('InforDegree', JSON.stringify(infor));

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
                <div className='user__form max-w-[640px] mx-auto border-separate border border-black rounded-lg'>
                    <div className='flex justify-between px-10'>
                        <img src={Degree} alt="" className='h-20' />
                        <h1 className='text-[30px] font-bold justify-center flex mb-5'>THÔNG TIN BẰNG CẤP</h1>
                        <img src={Degree} alt="" className='h-20' />
                    </div>

                    <Form className='user__info-form border-separate border border-slate-400 rounded-lg m-5'>
                        <FormGroup>
                            <div>
                                <label htmlFor="mssv">Mã số sinh viên</label><br />
                                <input type="text" placeholder='Nhập mã số sinh viên' id='mssv' className='max-w-[200px]' onChange={handleChange} />
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <label htmlFor="type">Loại bằng</label><br />
                                <select
                                    id="type"
                                    required
                                    className='rounded-lg border-separate border border-slate-400 p-1 mt-2'
                                    onChange={handleChange}
                                >
                                    <option value="Kỹ sư">Kỹ sư</option>
                                    <option value="Thạc sĩ">Thạc sĩ</option>
                                    <option value="Tiến sĩ">Tiến sĩ</option>
                                </select>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <label htmlFor="training">Hệ đào tạo</label><br />
                                <select
                                    id="training"
                                    required
                                    className='rounded-lg border-separate border border-slate-400 p-2 mt-2'
                                    onChange={handleChange}
                                >
                                    <option value="Chính quy">Chính quy</option>
                                    <option value="Từ xa">Từ xa</option>
                                </select>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <div>
                                <label htmlFor="major">Chuyên ngành đào tạo</label><br />
                                <select
                                    id="major"
                                    required
                                    className='rounded-lg border-separate border border-slate-400 p-2 mt-2'
                                    onChange={handleChange}
                                >
                                    <option value="An toàn thông tin">An toàn thông tin</option>
                                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                                    <option value="Hẹ thống thông tin">Hẹ thống thông tin</option>
                                    <option value="Khoa học máy tính">Khoa học máy tính</option>
                                    <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                                    <option value="Mạng máy tính và truyền thông dữ liệu">Mạng máy tính và truyền thông dữ liệu</option>
                                    <option value="Truyền thông đa phương tiện">Truyền thông đa phương tiện</option>
                                </select>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <FormGroup>
                                <div>
                                    <label htmlFor="number">Số hiệu</label><br />
                                    <input type="text" placeholder='Nhập số hiệu' id='number' className='max-w-[200px]' onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="inputbook">Số vào sổ cấp bằng</label><br />
                                    <input type="text" placeholder='Nhập số vào sổ cấp bằng' id='inputbook' className='max-w-[200px]' onChange={handleChange} />
                                </div>
                                {/* <div>
                                    <label htmlFor="image">Ảnh cấp bằng</label><br />
                                    <input type='file' id='image' className='max-w-[200px]' onChange={handleChange} accept="image/*" />
                                </div> */}
                            </FormGroup>

                        </FormGroup>
                    </Form>
                    <div className='flex justify-end px-5 pb-5'>
                        {/* <button type='submit' className="btn primary__btn w-100 mt-4">
                                Xác nhận
                            </button> */}
                        {/* <Link to={{
                                pathname: '/degree/create/verify',
                                state: { infor }
                            }}> */}
                        {/* </Link> */}
                        <button onClick={handleClick} className="bg-primaryColor px-6 text-white font-[600] h-[44px] flex items-center rounded-md">
                            <span>Xác nhận</span>
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DegreeCreate