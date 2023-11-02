import React, { useState, useEffect, useContext } from "react";
// import loginImg from "../asset/images/6310507.jpg";
import loginImg from "../asset/images/6310507.jpg"
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx"
import { BASE_URL } from "../utils/config";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

const Login = () => {

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  // console.log(dispatch);
  const handleChange = e => {
    setCredentials(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async e => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    // console.log("Role", credentials.role);
    try {
      const axiosInstance = axios.create({
        withCredentials: true
      })
      const response = await axiosInstance.post(`${BASE_URL}auth/login`, {
        email: credentials.email,
        password: credentials.password,
        role: 'admin',
      });

      const result = response.data;
      console.log("response.response", response);

      dispatch({ type: "LOGIN_SUCCESS", payload: result.data });
      navigate("/home");

    } catch (err) {
      console.log("loi r", err.response.data.message);
      toast.error(err.response.data.message, {
        autoClose: 2000,
        style: {
          background: 'red',
        }
      });
      dispatch({ type: "LOGIN_FAILURE", payload: err.message });
    }
  }
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
      <section className="px-5 xl:px-0">
        <div className="max-w-[1170px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* =============image box============= */}
            <div className="hidden lg:block bg-primaryColor rounded-l-lg">
              <figure className="rounded-l-lg">
                <img src={loginImg} alt="" className="w-full rounded-l-lg" />
              </figure>
            </div>

            {/* =============login form============= */}
            <div className="rounded-l-lg lg:pl-16 py-10">
              <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
                Đăng nhập <span className="text-primaryColor">tài khoản</span>
              </h3>

              <form onSubmit={handleClick}>
                <div className="mb-5">
                  <input
                    type="email"
                    placeholder="Nhập Email"
                    id="email"
                    className="w-full pr-4 py-3 
                  border-b border-solid border-[#0066ff61] focus:outline-none 
                  focus:border-b-primaryColor text-[16px] leading-7 text-headingColor 
                placeholder:text-textColor cursor-pointer"
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-5">
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    id="password"
                    required
                    onChange={handleChange}
                    className="w-full pr-4 py-3 
                  border-b border-solid border-[#0066ff61] focus:outline-none 
                  focus:border-b-primaryColor text-[16px] leading-7 text-headingColor 
                placeholder:text-textColor cursor-pointer"
                  />
                </div>
                <div>
                  <button type="submit" className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3">
                    Đăng Nhập
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
