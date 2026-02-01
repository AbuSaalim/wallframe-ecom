import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    auth: null,
    loading: false,
    error: null
}

export const authReducer = createSlice({
    name: 'authStore',
    initialState,
    reducers: {
        login: (state, action) => {
            state.auth = action.payload
            state.error = null
        },
        logout: (state) => {
            state.auth = null
            state.error = null
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})

export const { login, logout, setLoading, setError } = authReducer.actions
export default authReducer.reducer