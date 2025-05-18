import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../utils/baseURL';

const initialState = {
    incomes: [],
    loadingIncome: false,
    errorIncome: null,
    createIncome: false,
    deleteIncome: false,
    updateIncome: false,
}

export const addIncome = createAsyncThunk(
    "income/addIncome",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { source, amount, date, category, otherCategory, job, type, filename } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            }
            const formData = new FormData();
            formData.append('source', source);
            formData.append('amount', amount);
            formData.append('date', date);
            formData.append('category', category);
            formData.append('otherCategory', otherCategory);
            formData.append('job', job);
            formData.append('type', type);

            if (filename && filename.length > 0) {
                filename.forEach((file) => {
                    formData.append('files', file);
                });
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/income/addIncome`, formData, config)
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const deleteIncome = createAsyncThunk(
    "income/deleteIncome",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { incomeid } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/income/deleteIncome`, {
                incomeid
            }, config)
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const editIncome = createAsyncThunk(
    "income/editIncome",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { id, source, amount, date, category, otherCategory, job, type } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            }
            const formData = new FormData();
            formData.append("id", id);
            formData.append('source', source);
            formData.append('amount', amount);
            formData.append('date', date);
            formData.append('category', category);
            formData.append('otherCategory', otherCategory);
            formData.append('job', job);
            formData.append('type', type);

            const { data } = await axios.post(`${BASE_URL.serverURL}/income/editIncome`, formData, config)
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const viewAllIncome = createAsyncThunk(
    "income/viewAllIncome",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const { data } = await axios.get(`${BASE_URL.serverURL}/income/viewAllIncome`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

const incomeSlice = createSlice({
    name: "income",
    initialState,
    reducers: {
        resetIncomeState: (state) => {
            state.createIncome = false;
            state.updateIncome = false;
            state.deleteIncome = false;
            state.errorIncome = null;
        }
    },
    extraReducers: (builder) => {
        //add income
        builder.addCase(addIncome.pending, (state, action) => {
            state.loadingIncome = true;
        });
        builder.addCase(addIncome.fulfilled, (state, action) => {
            state.loadingIncome = false;
            state.createIncome = true;
            state.errorIncome = null;
        });
        builder.addCase(addIncome.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingIncome = false;
        });
        //view all income
        builder.addCase(viewAllIncome.pending, (state, action) => {
            state.loadingIncome = true;
        });
        builder.addCase(viewAllIncome.fulfilled, (state, action) => {
            state.incomes = action.payload;
            state.loadingIncome = false;
            state.errorIncome = null;
        });
        builder.addCase(viewAllIncome.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingIncome = false;
        });
        // delete income
        builder.addCase(deleteIncome.pending, (state, action) => {
            state.loadingIncome = true;
        });
        builder.addCase(deleteIncome.fulfilled, (state, action) => {
            state.incomes = action.payload;
            state.loadingIncome = false;
            state.errorIncome = null;
            state.deleteIncome = true;
        });
        builder.addCase(deleteIncome.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingIncome = false;
        });
        // edit income
        builder.addCase(editIncome.pending, (state, action) => {
            state.loadingIncome = true;
        });
        builder.addCase(editIncome.fulfilled, (state, action) => {
            state.incomes = action.payload;
            state.loadingIncome = false;
            state.errorIncome = null;
            state.updateIncome = true;
        });
        builder.addCase(editIncome.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingIncome = false;
        });
    },
})

export const { resetIncomeState } = incomeSlice.actions;
export default incomeSlice.reducer;