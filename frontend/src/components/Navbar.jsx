import React, { useState, useEffect } from "react";
import { IoMdPerson } from "react-icons/io";
import { GiHamburgerMenu, GiSplitCross } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { fetchCart, clearCart } from "../redux/cartSlice";

function Navbar() {
  const [showHam, setShowHam] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  // 🔥 FIXED — correct field from cartSlice
  const cartItems = useSelector((state) => state.cart.cartItems || []);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (userData) {
      dispatch(fetchCart());
    }
  }, [userData, dispatch]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      dispatch(clearCart());
      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm fixed top-0 left-0 w-full z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* LOGO */}
            <div
              className="flex-shrink-0 text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              TestPrep
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#categories" className="font-medium text-gray-600 hover:text-blue-600">Categories</a>
              <a href="/mocktests" className="font-medium text-gray-600 hover:text-blue-600">Mock Tests</a>
              <a href="#grand-tests" className="font-medium text-gray-600 hover:text-blue-600">Grand Tests</a>
              <a href="#testimonials" className="font-medium text-gray-600 hover:text-blue-600">Testimonials</a>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center space-x-4 relative">

              {/* CART ICON (only when logged in) */}
              {userData && (
                <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 p-2">
                  <FaShoppingCart className="w-6 h-6" />

                  {/* FIXED SAFE LENGTH CHECK */}
                  {cartItems?.length > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {cartItems?.length || 0}
                    </span>
                  )}
                </Link>
              )}

              {/* PROFILE */}
              {!userData ? (
                <IoMdPerson
                  className="w-[45px] h-[45px] p-2 bg-black text-white rounded-full cursor-pointer border-2 border-white"
                  onClick={() => setShowPro((prev) => !prev)}
                />
              ) : (
                <div
                  className="w-[45px] h-[45px] rounded-full text-white flex items-center justify-center text-[18px] border-2 bg-black border-white cursor-pointer"
                  onClick={() => setShowPro((prev) => !prev)}
                >
                  {userData.photoUrl ? (
                    <img
                      src={userData.photoUrl}
                      alt="profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    userData?.name?.slice(0, 1).toUpperCase()
                  )}
                </div>
              )}

              {/* LOGIN / LOGOUT BUTTON */}
              {!userData ? (
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium bg-white text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50"
                >
                  Logout
                </button>
              )}

              {/* PROFILE DROPDOWN */}
              {showPro && userData && (
                <div className="absolute top-14 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-md p-2 flex flex-col">
                  <span
                    className="px-3 py-2 text-gray-800 hover:bg-blue-50 rounded cursor-pointer"
                    onClick={() => {
                      navigate("/profile");
                      setShowPro(false);
                    }}
                  >
                    My Profile
                  </span>

                  <span
                    className="px-3 py-2 text-gray-800 hover:bg-blue-50 rounded cursor-pointer"
                    onClick={() => {
                      navigate("/mycourses");
                      setShowPro(false);
                    }}
                  >
                    My Courses
                  </span>
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center">
              <GiHamburgerMenu
                className="w-7 h-7 text-gray-800 cursor-pointer"
                onClick={() => setShowHam(true)}
              />
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center transition-transform duration-500 ${
          showHam ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <GiSplitCross
          className="absolute top-6 right-6 text-white w-8 h-8 cursor-pointer"
          onClick={() => setShowHam(false)}
        />

        {/* PROFILE CIRCLE */}
        {!userData ? (
          <IoMdPerson className="w-[60px] h-[60px] p-2 bg-black text-white rounded-full border-2 border-white mb-6" />
        ) : (
          <div
            className="w-[60px] h-[60px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black border-white cursor-pointer mb-6"
            onClick={() => {
              navigate("/profile");
              setShowHam(false);
            }}
          >
            {userData.photoUrl ? (
              <img
                src={userData.photoUrl}
                alt="profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              userData?.name?.slice(0, 1).toUpperCase()
            )}
          </div>
        )}

        {/* MOBILE LINKS */}
        <a
          href="#categories"
          className="text-white text-lg mb-3 hover:text-blue-400"
          onClick={() => setShowHam(false)}
        >
          Categories
        </a>
        <a
          href="/mocktests"
          className="text-white text-lg mb-3 hover:text-blue-400"
          onClick={() => setShowHam(false)}
        >
          Mock Tests
        </a>
        <a
          href="#grand-tests"
          className="text-white text-lg mb-3 hover:text-blue-400"
          onClick={() => setShowHam(false)}
        >
          Grand Tests
        </a>
        <a
          href="#testimonials"
          className="text-white text-lg mb-6 hover:text-blue-400"
          onClick={() => setShowHam(false)}
        >
          Testimonials
        </a>

        {/* LOGIN / LOGOUT BUTTONS */}
        {!userData ? (
          <button
            className="px-8 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-700"
            onClick={() => {
              navigate("/login");
              setShowHam(false);
            }}
          >
            Login
          </button>
        ) : (
          <button
            className="px-8 py-3 text-black bg-white rounded-full hover:bg-gray-200"
            onClick={() => {
              handleLogout();
              setShowHam(false);
            }}
          >
            Logout
          </button>
        )}
      </div>
    </>
  );
}

export default Navbar;
