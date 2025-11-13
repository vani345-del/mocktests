import React, { useState } from "react";
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const user = result.data;

      // ⭐ ONLY dispatch user data
      dispatch(setUserData(user));

  

      setLoading(false);
      toast.success("Login Successfully");

    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="bg-[#dddbdb] w-[100vw] h-[100vh] flex justify-center items-center">
      <form
        className="w-[90%] md:w-200 h-150 bg-white shadow-xl rounded-2xl flex"
        onSubmit={handleLogin}
      >
        <div className="md:w-[50%] w-[100%] h-[100%] flex flex-col justify-center items-center gap-3">

          <div>
            <h1 className="font-semibold text-black text-2xl">Welcome Back</h1>
            <h2 className="text-[#999797] text-[18px]">Login to your Account</h2>
          </div>

          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3">
            <label htmlFor="email" className="font-semibold">Email</label>
            <input
              id="email"
              type="text"
              className="border-1 w-full h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="Your Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3 relative">
            <label htmlFor="password" className="font-semibold">Password</label>
            <input
              id="password"
              type={show ? "text" : "password"}
              className="border-1 w-full h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="***********"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />

            {!show && (
              <MdOutlineRemoveRedEye
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]"
                onClick={() => setShow((prev) => !prev)}
              />
            )}

            {show && (
              <MdRemoveRedEye
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]"
                onClick={() => setShow((prev) => !prev)}
              />
            )}
          </div>

          <button
            type="submit"
            className="w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center justify-center rounded-[5px]"
            disabled={loading}
          >
            {loading ? <ClipLoader size={30} color="white" /> : "Login"}
          </button>

          <span
            className="text-[13px] cursor-pointer text-[#585757]"
            onClick={() => navigate("/forget")}
          >
            Forget your Password?
          </span>

          <div className="w-[80%] flex items-center gap-2">
            <div className="w-[25%] h-[0.5px] bg-[#c4c4c4]"></div>
            <div className="w-[50%] text-[15px] text-[#6f6f6f] flex items-center justify-center">
              Or continue with
            </div>
            <div className="w-[25%] h-[0.5px] bg-[#c4c4c4]"></div>
          </div>

          <div className="text-[#6f6f6f]">
            Create New Account?{" "}
            <span
              className="underline underline-offset-1 text-black cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Signup
            </span>
          </div>

        </div>
      </form>
    </div>
  );
};

export default Login;
