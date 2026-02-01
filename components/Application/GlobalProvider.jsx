'use client'

import React, { Suspense } from 'react'
import { persistor, store } from '@/store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Loading from './Loading'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

// Ensure axios sends cookies for same-origin requests (auth cookies)
axios.defaults.withCredentials = true

const queryClient = new QueryClient()

const GlobalProvider = ({children}) => {
  return (
    <QueryClientProvider client={queryClient}>
    <Provider store={store}>
        <PersistGate persistor={persistor} loading={<Loading/>} >
        {children}
        <ToastContainer />
        </PersistGate>

    </Provider>
    <Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false}/>
    </Suspense>
    </QueryClientProvider>
  )
}

export default GlobalProvider
