
import  {configureStore} from '@reduxjs/toolkit'
import userSlice from './userSlice.js'
import mockTestSlice from './mockTestSlice.js'
import categoryReducer from './categorySlice';


export const store=configureStore({
    reducer:{
        user:userSlice,
        mocktest: mockTestSlice,
        category: categoryReducer,
        
    }
})
