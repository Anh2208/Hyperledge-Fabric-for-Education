import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo_ctu from "../../asset/images/logo.png";
import student from "../../asset/images/student.png";

const navlinks = [
  {
    path: "./home",
    display: "Home",  
  },
  {
    path: "./student",
    display: "Student",
  },
  {
    path: "./services",
    display: "Services",
  },
  {
    path: "./login",
    display: "Login",
  },
];

const Header = () => {
  return (
    <header className="header flex items-center">
      <div className="container">
        <div className="flex items-center justify-between">
          {/* ==============Logo============== */}
          <div>
            <img src={logo_ctu} alt="" />
          </div>

          {/* ==========menu=========== */}
          <div className="navigation">
            <ul className="menu flex items-center gap-[2.7rem]">
              {navlinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={(navClass) =>
                      navClass.isActive
                        ? "text-primaryColor text-[16px] leading-7 font-[600]"
                        : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                    }
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* =============nav right============== */}
          <div className="flex items-center gap-4">
            <Link to="/">
              <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center rounded-[50px]">
                Xin chao B1906425
              </button>
            </Link>
            <div>
              <Link to="/login">
                <figure className="w-[35px] h-[35px] rounded-full cursor-pointer">
                  <img src={student} className="w-full rounded-full" alt="" />
                </figure>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
