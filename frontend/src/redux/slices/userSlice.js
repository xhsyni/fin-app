import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../utils/baseURL';

const initialState = {
    userAuth: {
        loading: false,
        isLoggedIn: false,
        error: null,
        userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null,
    },
    successSignUp: false,
}

export const loginUser = createAsyncThunk(
    "users/login",
    async ({ email, password }, { rejectWithValue, getState, dispatch }) => {
        try {
            const { data } = await axios.post(`${BASE_URL.serverURL}/users/login`, {
                email, password
            });
            localStorage.setItem('userInfo', JSON.stringify(data))
            return data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error?.response?.data);
        }
    }
);
export const signupUser = createAsyncThunk(
    "users/signupUser",
    async ({ name, email, password }, { rejectWithValue, getState, dispatch }) => {
        try {
            const { data } = await axios.post(`${BASE_URL.serverURL}/users/signupUser`, {
                name, email, password
            });
            return data;
        } catch (error) {
            console.log(error);
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const logoutUser = createAsyncThunk(
    "user/logout",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            localStorage.removeItem('userInfo');
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async (payload, { rejectWithValue, getState, dispatch }) => {
        try {
            const { name, email, phone, job, birth_date, marital_status, ethnicity, gender, nationality } = payload
            const token = getState()?.user?.userAuth?.userInfo?.token?.access;
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
            const data = await axios.post(`${BASE_URL.serverURL}/users/updateUser`, payload, config);
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data);
        }
    }
)


const userSlice = createSlice({
    name: 'user',
    initialState,
    extraReducers: (builder) => {
        //signup
        builder.addCase(signupUser.pending, (state, action) => {
            state.userAuth.loading = true;
        });
        builder.addCase(signupUser.fulfilled, (state, action) => {
            state.userAuth.loading = false;
            state.successSignUp = true;
        });
        builder.addCase(signupUser.rejected, (state, action) => {
            state.userAuth.error = action.payload;
            state.userAuth.loading = false;
            state.userAuth.isLoggedIn = true;
        });
        //login
        builder.addCase(loginUser.pending, (state, action) => {
            state.userAuth.loading = true;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.userAuth.userInfo = action.payload;
            state.userAuth.loading = false;
            state.userAuth.isLoggedIn = true;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.userAuth.error = action.payload;
            state.userAuth.loading = false;
            state.userAuth.isLoggedIn = true;
        });
    },
});

export default userSlice.reducer;