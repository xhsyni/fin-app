import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../utils/baseURL';

const initialState = {
    expenses: [],
    loadingExpense: false,
    errorExpense: null,
    createExpense: false,
    deleteExpense: false,
    updateExpense: false,
    loadingExtract: false,
    extractedExpense: [],
}

export const viewAllExpense = createAsyncThunk(
    "expenses/viewAllExpenses",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const { data } = await axios.get(`${BASE_URL.serverURL}/expenses/viewAllExpenses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const addExpenses = createAsyncThunk(
    "expenses/addExpenses",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { date, category, otherCategory, sub_category, otherSubCategory, amount, name, description, filename, isDeductible } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            };
            const formData = new FormData();
            formData.append('date', date);
            formData.append('category', category);
            formData.append('otherCategory', otherCategory);
            formData.append('sub_category', sub_category);
            formData.append('otherSubCategory', otherSubCategory);
            formData.append('amount', amount);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('isDeductible', isDeductible);

            if (filename && filename.length > 0) {
                filename.forEach((file) => {
                    formData.append('files', file);
                });
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/expenses/addExpenses`,
                formData,
                config
            );
            return data
        } catch (error) {
            console.log(error);
            return rejectWithValue(error?.response.data);
        }
    }
);


export const editExpenses = createAsyncThunk(
    "expenses/editExpenses",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { id, date, category, otherCategory, sub_category, otherSubCategory, amount, expense_name, description, deductible } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            };
            const formData = new FormData();
            formData.append('id', id);
            formData.append('date', date);
            formData.append('category', category);
            formData.append('otherCategory', otherCategory);
            formData.append('sub_category', sub_category);
            formData.append('otherSubCategory', otherSubCategory);
            formData.append('amount', amount);
            formData.append('name', expense_name);
            formData.append('description', description);
            formData.append('deductible', deductible);

            const { data } = await axios.post(`${BASE_URL.serverURL}/expenses/editExpenses`,
                formData,
                config
            );
            return data
        } catch (error) {
            console.log(error);
            return rejectWithValue(error?.response.data);
        }
    }
);

export const extractFile = createAsyncThunk(
    "expenses/extractFile",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
            const formData = new FormData();
            payload.forEach((file) => {
                formData.append('file', file);
            });
            const { data } = await axios.post(`${BASE_URL.serverURL}/expenses/extractFile`, formData, config)
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const deleteExpenses = createAsyncThunk(
    "expenses/deleteExpenses",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { expenseid } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/expenses/deleteExpenses`, {
                expenseid
            }, config)
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

const expenseSlice = createSlice({
    name: 'expense',
    initialState,
    reducers: {
        resetExpenseState: (state) => {
            state.createExpense = false;
            state.updateExpense = false;
            state.deleteExpense = false;
            state.errorExpense = null;
            state.extractedExpense = [];
            state.loadingExtract = false;
        }
    },
    extraReducers: (builder) => {
        // viewAllExpense
        builder.addCase(viewAllExpense.pending, (state, action) => {
            state.loadingExpense = true;
        });
        builder.addCase(viewAllExpense.fulfilled, (state, action) => {
            state.expenses = action.payload
            state.loadingExpense = false;
            state.errorExpense = null;
        });
        builder.addCase(viewAllExpense.rejected, (state, action) => {
            state.errorExpense = action.payload;
            state.loadingExpense = false;
        });
        // addExpenses
        builder.addCase(addExpenses.pending, (state, action) => {
            state.loadingExpense = true;
        });
        builder.addCase(addExpenses.fulfilled, (state, action) => {
            state.expenses = action.payload
            state.loadingExpense = false;
            state.createExpense = true;
            state.errorExpense = null;
        });
        builder.addCase(addExpenses.rejected, (state, action) => {
            state.errorExpense = action.payload;
            state.loadingExpense = false;
        });
        // edit Expenses
        builder.addCase(editExpenses.pending, (state, action) => {
            state.loadingExpense = true;
        });
        builder.addCase(editExpenses.fulfilled, (state, action) => {
            state.expenses = action.payload
            state.loadingExpense = false;
            state.updateExpense = true;
            state.errorExpense = null;
        });
        builder.addCase(editExpenses.rejected, (state, action) => {
            state.errorExpense = action.payload;
            state.loadingExpense = false;
        });
        // delete Expenses
        builder.addCase(deleteExpenses.pending, (state, action) => {
            state.loadingExpense = true;
        });
        builder.addCase(deleteExpenses.fulfilled, (state, action) => {
            state.expenses = action.payload
            state.loadingExpense = false;
            state.deleteExpense = true;
            state.errorExpense = null;
        });
        builder.addCase(deleteExpenses.rejected, (state, action) => {
            state.errorExpense = action.payload;
            state.loadingExpense = false;
        });
        // extract file
        builder.addCase(extractFile.pending, (state, action) => {
            state.loadingExtract = true;
        });
        builder.addCase(extractFile.fulfilled, (state, action) => {
            state.extractedExpense = action.payload;
            state.loadingExtract = false;
            state.errorExpense = null;
        });
        builder.addCase(extractFile.rejected, (state, action) => {
            state.errorExpense = action.payload;
            state.loadingExtract = false;
        });
    },
});

export const { resetExpenseState } = expenseSlice.actions;
export default expenseSlice.reducer;