import { useEffect, useState, useRef, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import logo_ctu from "../../asset/images/Logo_Dai_hoc_Can_Tho.svg";
import admin from "../../asset/images/icon_user.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext'

const Header = () => {
  const { user } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    // đóng menu
    navigate('/login')
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

  return (
    <header className="header flex items-center">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <img className="w-[130px] h-[100px]" src={logo_ctu} alt="" />
          </div>
          <div className="navigation">
            <h1 className="font-[600] h-[44px] text-blue-800 text-[50px] flex items-center text__heading">
              Hệ thống quản lý
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <h1 className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center rounded-[50px] welcome__heading">
                Xin chào &nbsp; {user && user.name ? user.name : ussername}
              </h1>
            ) : (
              null
            )}
            <div className="relative" ref={menuRef}>
              <figure className="w-[35px] h-[35px] rounded-full cursor-pointer" onClick={toggleMenu}>
                <img src={admin} className="w-full rounded-full" alt="Image" />
              </figure>
              {showMenu && (
                <ul className="absolute top-10 right-0 min-w-[95px] w-full bg-white border-2 border-gray-500 rounded shadow mt-2 select-header">
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
