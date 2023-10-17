import React, { useState, useEffect } from "react";
import loginImg from "../asset/images/6310507.jpg";
import { Button, ButtonGroup } from "reactstrap";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    role: ""
  })

  const handleChange = e => {
    setCredentials(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async e => {
    e.preventDefault();
  }
}


const Signup = () => {
  return (
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
              Login an <span className="text-primaryColor">account</span>
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

              <div className="mb-10 flex items-center justify-between">
                <label htmlFor="" className="text-headingColor font-bold text-[16px] leading-7">
                  Bạn là:
                  <select id="role" onChange={handleChange} className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none">
                    <option value="Student">Sinh viên</option>
                    <option value="Teacher">Giảng viên</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
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
  );
};

export default Signup;
