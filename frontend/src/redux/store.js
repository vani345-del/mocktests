
import  {configureStore} from '@reduxjs/toolkit'
import userSlice from './userSlice.js'
import mockTestSlice from './mockTestSlice.js'
import categoryReducer from './categorySlice';
import cartReducer from './cartSlice.js';
import dashboardReducer from "./dashboardSlice.js";
import instructorReducer from "./instructorSlice";
// --- 👇 ADD THIS IMPORT ---
import studentReducer from "./studentSlice";


export const store=configureStore({
    reducer:{
        user:userSlice,
        mocktest: mockTestSlice,
        category: categoryReducer,
        cart: cartReducer,
        dashboard: dashboardReducer,
        instructors: instructorReducer,
        students: studentReducer,
        
    }
})
