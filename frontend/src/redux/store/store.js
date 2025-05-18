// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../slices/userSlice';
import expenseReducer from '../slices/expenseSlice';
import incomeReducer from '../slices/incomeSlice';
import taxReducer from '../slices/taxSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        expense: expenseReducer,
        income: incomeReducer,
        tax: taxReducer,
    },
});
export default store;
