import React, { useState } from 'react'

// import logo from '../assets/logo.png'
// import google from '../assets/google.png'
import { MdOutlineRemoveRedEye } from "react-icons/md";

import { MdRemoveRedEye } from "react-icons/md";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
// import { serverUrl } from '../App'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify';
import { setUserData } from '../redux/userSlice';
import { useDispatch } from 'react-redux';
// import { signInWithPopup } from 'firebase/auth';
// import { auth, provider } from '../../utils/firebase';



const SignUp = () => {
    const [name,setName]= useState("")
    const [email,setEmail]= useState("")
    const [password,setPassword]= useState("")
    
    const navigate = useNavigate()
    let [show,setShow] = useState(false)
    const [loading,setLoading]= useState(false)
    const dispatch=useDispatch()
    const serverUrl=import.meta.env.VITE_SERVER_URL
    
     const handleSignUp = async () => {
        
        try {
            const result = await axios.post(serverUrl + "/api/auth/signup" , {name , email , password}, { withCredentials: true }  
                
             )
            dispatch(setUserData(result.data))

            setLoading(false)
            navigate("/")
            toast.success("SignUp Successfully")
            console.log(result.data);
            
        } 
        catch (error) {
            console.log(error)
          
            toast.error(error.response.data.message)
        }
        
    }

//   const googleSignUp = async () => {
  
//   try {
//     const response = await signInWithPopup(auth, provider);
//      let user=response.user
//      let name=user.displayName
//      let email=user.email
//      let uid = user.uid; 

//     const result = await axios.post(
//       serverUrl + "/api/auth/googleauth",
//       { name, email, googleId: uid  },
//       { withCredentials: true }
//     );
//     dispatch(setUserData(result.data));
//     navigate("/");
  
//     toast.success("SignUp Successfully");
//    // Navigate after success
//   } catch (error) {
//     console.log(error);
//     toast.error(error.response?.data?.message || "Google SignUp Failed");
//   }
// };



  return (
    <div className='bg-[#dddbdb] w-[100vw] h-[100vh] flex justify-center items-center'>
        <form className='w-[90%] md:w-200 h-150 bg-[white] shadow-xl rounded-2xl flex' onSubmit={(e)=>e.preventDefault()}>
            {/* leftdiv */}
            <div className='md:w[50%] w-[100%] h-[100%] flex flex-col justify-center items-center  gap-3'>
                 <div><h1 className='font-semibold text-[black] text-2xl'>Let's get Started</h1>
                <h2 className='text-[#999797] text-[18px]'>Create your account</h2>
                </div>
                <div className='flex flex-col gap-1 w-[80%] items-start justify-center px-3'>
                    <label htmlFor="name" className='font-semibold'>
                        Name
                    </label>
                    <input id='name' type="text" className='border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]'placeholder='Enter you name' onChange={(e)=>setName(e.target.value)}  value={name}/>
                </div>
                <div className='flex flex-col gap-1 w-[80%] items-start justify-center px-3'>
                    <label htmlFor="email" className='font-semibold'>
                        Email
                    </label>
                    <input id='email' type="text" className='border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]'placeholder='Enter Your Email' onChange={(e)=>setEmail(e.target.value)}  value={email} />
                </div>

                <div className='flex flex-col gap-1 w-[80%] items-start justify-center px-3 relative'>
                    <label htmlFor="password" className='font-semibold'>
                        Password
                    </label>
                    <input id='password' type={show?"text":"password"} className='border-1 w-[100%] h-[35px] border-[#e7e6e6] text-[15px] px-[20px]' placeholder='***********' onChange={(e)=>setPassword(e.target.value)} value={password}/>
                    {!show && <MdOutlineRemoveRedEye className='absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]' onClick={()=>setShow(prev => !prev)}/>}
              {show && <MdRemoveRedEye className='absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]' onClick={()=>setShow(prev => !prev)} />}
                </div>
                 <button className='w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center justify-center rounded-[5px]'  onClick={handleSignUp} disabled={loading}>{loading ? <ClipLoader size={30} color='white'/> :"Sigup"}</button>
                  <div className='w-[80%] flex items-center gap-2'>
                    <div className='w-[25%] h-[0.5px] bg-[#c4c4c4]'></div>
                    <div className='w-[50%] text-[15px] text-[#6f6f6f] flex items-center justify-center cursor-pointer '>Or continue with</div>
                    <div className='w-[25%] h-[0.5px] bg-[#c4c4c4]'></div>
                </div>
                 {/* <div className='w-[80%] h-[40px] border-1 border-[black] rounded-[5px] flex items-center justify-center'onClick={googleSignUp}><img src={google} alt="" className='w-[25px]' /><span className='text-[18px] text-gray-500'>oogle</span> </div> */}
                 <div className='text-[#6f6f6f]'>Already have an account? <span className='underline underline-offset-1 text-[black] cursor-pointer'onClick={()=>navigate("/login")}>Login</span></div>

                
        
    

                





            </div>
            {/* right div */}
            {/* <div className='w-[50%] h-[100%] rounded-r-2xl bg-[black] md:flex items-center justify-center flex-col hidden'><img src={logo} className='w-80 shadow-2xl' alt="" />
            <span className='text-[white] text-2xl'></span>
            </div> */}

            </form>


    </div>
  )
}

export default SignUp