import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo_ctu from "../../asset/images/Logo_Dai_hoc_Can_Tho.svg";
import admin from "../../asset/images/icon_user.png";

const Header = () => {
  return (
    <header className="header flex items-center">
      <div className="container">
        <div className="flex items-center justify-between">
          {/* ==============Logo============== */}
          <div>
            <img className="w-[130px] h-[100px]" src={logo_ctu} alt="" />
          </div>

          {/* ==========menu=========== */}
          <div className="navigation">
            <h1 className="font-[600] h-[44px] text-blue-800 text-[50px] flex items-center text__heading">Hệ thống quản lý</h1>
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
                  <img src={admin} className="w-full rounded-full" alt="" />
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
