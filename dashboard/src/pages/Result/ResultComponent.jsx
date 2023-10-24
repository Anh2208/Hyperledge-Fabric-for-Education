import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { Form, FormGroup, Button } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../../utils/config';
import LoadingSpinner from '../../hooks/LoadingSpinner';

const ResultComponent = () => {
    return (
        <>
            <section className='content-main'>
                <div className="content-header">
                    <h2 className="content-title">Thêm học phần</h2>
                    <div>
                        <Link to={"/course"} className='btn btn-primary'>
                            <i className='material-icons md-plus'></i>Trở về
                        </Link>
                    </div>
                </div>
                <div className='user__form'>
                    
                </div>
            </section>
        </>
    )
}

export default ResultComponent