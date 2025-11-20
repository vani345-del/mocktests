// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, User, ShoppingCart, LogOut, LogIn, BookOpen, Layers, TrendingUp } from "lucide-react";
import { IoMdPerson } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
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
  const cartItems = useSelector((state) => state.cart.cartItems || []);

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (userData) dispatch(fetchCart());
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
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800 shadow-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* LOGO */}
            <div
              onClick={() => navigate("/")}
              className="text-2xl font-black cursor-pointer tracking-tight flex items-center space-x-1"
            >
              <span className="text-cyan-400">EXAM</span>
              <span className="text-gray-100">PRO</span>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#categories" className="text-gray-300 hover:text-cyan-400 transition">Categories</a>
              <Link to="/mocktests" className="text-gray-300 hover:text-cyan-400 transition">Mock Tests</Link>
              <a href="#grand-tests" className="text-gray-300 hover:text-cyan-400 transition">Grand Tests</a>
              <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition">Testimonials</a>
            </div>

            {/* DESKTOP RIGHT SIDE */}
            <div className="hidden md:flex items-center space-x-4 relative">

              {/* CART */}
              {userData && (
                <Link to="/cart" className="relative text-gray-300 hover:text-cyan-400 p-2">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold flex items-center justify-center bg-red-600 text-white rounded-full ring-2 ring-gray-900">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* PROFILE ICON */}
              {!userData ? (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-bold text-gray-900 bg-cyan-400 hover:bg-cyan-300 rounded-full shadow transition"
                >
                  Login
                </button>
              ) : (
                <>
                  {/* Avatar */}
                  <div
                    onClick={() => setShowPro(!showPro)}
                    className="w-[42px] h-[42px] rounded-full overflow-hidden border border-gray-700 cursor-pointer hover:border-cyan-400 transition"
                  >
                    {userData.photoUrl ? (
                      <img src={userData.photoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white font-bold">
                        {userData?.name?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-cyan-400 border border-cyan-600 bg-gray-900 rounded-full hover:bg-gray-800"
                  >
                    {loading ? "..." : "Logout"}
                  </button>

                  {/* DROPDOWN */}
                  {showPro && (
                    <div className="absolute top-14 right-0 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowPro(false)}
                        className="block px-3 py-2 hover:bg-gray-800 rounded text-gray-200"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/mycourses"
                        onClick={() => setShowPro(false)}
                        className="block px-3 py-2 hover:bg-gray-800 rounded text-gray-200"
                      >
                        My Courses
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center space-x-4">

              {/* CART ICON MOBILE */}
              {userData && (
                <Link to="/cart" className="relative text-gray-300 hover:text-cyan-400">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-xs font-bold flex items-center justify-center bg-red-600 text-white rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}

              <Menu
                className="w-7 h-7 text-cyan-400 cursor-pointer"
                onClick={() => setShowHam(true)}
              />
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 w-full h-full bg-gray-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-center transition-all duration-500 ${
          showHam ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <X
          className="absolute top-6 right-6 w-8 h-8 text-cyan-400 cursor-pointer"
          onClick={() => setShowHam(false)}
        />

        {/* PROFILE MOBILE */}
        <div className="text-center mb-10">
          {userData ? (
            <div
              className="w-[70px] h-[70px] rounded-full border border-cyan-400 overflow-hidden mx-auto mb-4"
              onClick={() => {
                navigate("/profile");
                setShowHam(false);
              }}
            >
              <img src={userData.photoUrl} className="w-full h-full object-cover" />
            </div>
          ) : (
            <User className="w-[70px] h-[70px] p-2 text-gray-300 border border-gray-700 rounded-full mx-auto mb-4" />
          )}

          <p className="text-lg text-white">
            {userData ? `Welcome, ${userData.name}` : "Guest Mode"}
          </p>
        </div>

        {/* MOBILE LINKS */}
        <div className="flex flex-col gap-6 text-xl font-medium mb-12">
          <a
            href="#categories"
            onClick={() => setShowHam(false)}
            className="flex items-center space-x-3 text-white hover:text-cyan-400"
          >
            <Layers className="w-5 h-5" />
            <span>Categories</span>
          </a>

          <Link
            to="/mocktests"
            onClick={() => setShowHam(false)}
            className="flex items-center space-x-3 text-white hover:text-cyan-400"
          >
            <BookOpen className="w-5 h-5" />
            <span>Mock Tests</span>
          </Link>

          <a
            href="#grand-tests"
            onClick={() => setShowHam(false)}
            className="flex items-center space-x-3 text-white hover:text-cyan-400"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Grand Tests</span>
          </a>

          <a
            href="#testimonials"
            onClick={() => setShowHam(false)}
            className="flex items-center space-x-3 text-white hover:text-cyan-400"
          >
            <User className="w-5 h-5" />
            <span>Testimonials</span>
          </a>

          {userData && (
            <Link
              to="/mycourses"
              onClick={() => setShowHam(false)}
              className="flex items-center space-x-3 text-white hover:text-cyan-400"
            >
              <BookOpen className="w-5 h-5" />
              <span>My Courses</span>
            </Link>
          )}
        </div>

        {/* LOGIN / LOGOUT BUTTONS MOBILE */}
        {!userData ? (
          <button
            className="w-64 px-8 py-3 text-lg font-bold text-gray-900 bg-cyan-400 rounded-full hover:bg-cyan-300"
            onClick={() => {
              navigate("/login");
              setShowHam(false);
            }}
          >
            Login / Sign Up
          </button>
        ) : (
          <button
            onClick={() => {
              handleLogout();
              setShowHam(false);
            }}
            className="w-64 px-8 py-3 text-lg font-bold border-2 border-cyan-600 text-white bg-gray-900 rounded-full hover:bg-gray-800"
          >
            Logout
          </button>
        )}
      </div>
    </>
  );
}

export default Navbar;
