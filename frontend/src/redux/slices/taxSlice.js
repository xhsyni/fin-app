import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../utils/baseURL';

const initialState = {
    taxs: [],
    loadingTax: false,
    createTax: false,
    errorTax: false,
    messagesChat: "",
    exportReportPath: null
}

export const viewAllTax = createAsyncThunk(
    "tax/viewAllTax",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const { data } = await axios.get(`${BASE_URL.serverURL}/tax/viewAllTax`, config)
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const chatWithAI = createAsyncThunk(
    "tax/chatWithAI",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/tax/chatWithAI`,
                payload,
                config
            )
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const addTax = createAsyncThunk(
    "tax/addTax",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { create } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/tax/addTax`,
                create
                , config)
            return data;
        }
        catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const updateTax = createAsyncThunk(
    "tax/updateTax",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { create } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const { data } = await axios.post(`${BASE_URL.serverURL}/tax/updateTax`, create, config)
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data)
        }
    }
)

export const exportReport = createAsyncThunk(
    "tax/exportReport",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { create } = payload;
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const res = await axios.post(`${BASE_URL.serverURL}/tax/exportReport`, create, config);

            const baseUrl = BASE_URL.serverURL.split('/api')[0];
            const url = `${baseUrl}${res.data.excel_url}`;

            const link = document.createElement('a');
            link.href = url;
            link.download = `Income_Report_${create.year || 'all'}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)

const taxSlice = createSlice({
    name: "tax",
    initialState,
    reducers: {
        resetIncomeState: (state) => {
            state.loadingTax = false;
            state.createTax = false;
            state.errorTax = false;
        }
    },
    extraReducers: (builder) => {
        // chat with AI
        builder.addCase(chatWithAI.pending, (state, action) => {
            state.loadingTax = true;
        });
        builder.addCase(chatWithAI.fulfilled, (state, action) => {
            state.loadingTax = false;
            state.messagesChat = action.payload.messageQwen;
            state.errorTax = null;
        });
        builder.addCase(chatWithAI.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingTax = false;
        });
        // add Tax
        builder.addCase(addTax.pending, (state, action) => {
            state.loadingTax = true;
        });
        builder.addCase(addTax.fulfilled, (state, action) => {
            state.loadingTax = false;
            state.createTax = true;
            state.errorTax = null;
        });
        builder.addCase(addTax.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingTax = false;
        });
        // view all tax
        builder.addCase(viewAllTax.pending, (state, action) => {
            state.loadingTax = true;
        });
        builder.addCase(viewAllTax.fulfilled, (state, action) => {
            state.loadingTax = false;
            state.taxs = action.payload;
            state.errorTax = null;
        });
        builder.addCase(viewAllTax.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingTax = false;
        });
        // update tax
        builder.addCase(updateTax.pending, (state, action) => {
            state.loadingTax = true;
        });
        builder.addCase(updateTax.fulfilled, (state, action) => {
            state.loadingTax = false;
            state.updateTax = true;
            state.errorTax = null;
        });
        builder.addCase(updateTax.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingTax = false;
        });
        // export tax
        builder.addCase(exportReport.pending, (state, action) => {
            state.loadingTax = true;
        });
        builder.addCase(exportReport.fulfilled, (state, action) => {
            state.loadingTax = false;
            state.exportReportPath = action.payload;
            state.errorTax = null;
        });
        builder.addCase(exportReport.rejected, (state, action) => {
            state.errorIncome = action.payload;
            state.loadingTax = false;
        });
    }
})

export const { resetIncomeState } = taxSlice.actions;
export default taxSlice.reducer;