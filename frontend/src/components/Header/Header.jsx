import { useEffect, useState, useContext, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import logo_ctu from "../../asset/images/Logo_Dai_hoc_Can_Tho.svg";
import teacher from "../../asset/images/icon_user.png";
import student from "../../asset/images/student.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Cookies from "js-cookie";

const Header = () => {
  const { user } = useContext(AuthContext);
  // const [role, setRole] = useState(user && (user.role));
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    // localStorage.removeItem("UserToken");
    localStorage.removeItem("user");

    // đóng menu
    navigate('/login');
  };

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  // console.log("Reol is ", role);
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
          <div className="flex items-center gap-4 ">
            <h1 className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center rounded-[50px] welcome__heading">
              Xin chào &nbsp;
              {user ? (
                user.role === "Teacher" ? user.name : user.name
              ) : null}

            </h1>
            <div className="relative" ref={menuRef}>
              <figure className="w-[35px] h-[35px] rounded-full cursor-pointer" onClick={toggleMenu}>
                {user && user.role == 'Teacher' ? (
                  <img src={teacher} className="w-full rounded-full" alt="Image" />
                ) : (
                  <img src={student} className="w-full rounded-full" alt="Image" />
                )}
              </figure>
              {showMenu && (
                <ul className="absolute top-10 right-0 min-w-[100px] w-full bg-white border-2 border-gray-500 rounded shadow mt-2 select-header">
                  <li>
                    <Link to="/" className="w-full flex">
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Đăng xuất</button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
