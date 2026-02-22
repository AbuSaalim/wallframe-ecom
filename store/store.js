import { combineReducers, configureStore } from "@reduxjs/toolkit"
import persistReducer from "redux-persist/es/persistReducer"
import persistStore from "redux-persist/es/persistStore"
import localStorage from "redux-persist/es/storage"
import authReducer from "./reducer/authReducer"
import cartReducer from "./reducer/cartStore"
// 👇 1. Yahan wishlist reducer ko import kiya
import wishlistReducer from "./reducer/wishlistReducer" 

const rootReducer = combineReducers({
    authStore: authReducer,
    cartStore: cartReducer,
    // 👇 2. Yahan rootReducer mein add kar diya
    wishlistStore: wishlistReducer 
})

const persistConfig = { 
    key: 'root',
    storage: localStorage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer, 
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
})

export const persistor = persistStore(store)