'use client'

import React, { ReactNode, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { store, persistor } from '@/store/store'
import { initializeCart } from '@/store/reducer/cartStore'

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface RootProviderProps {
  children: ReactNode
}

// Cart initializer component
function CartInitializer() {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(initializeCart())
  }, [dispatch])
  
  return null
}

/**
 * Root Provider Component
 * Wraps the entire app with all necessary providers:
 * - Redux + Redux Persist (for auth state)
 * - React Query (for server state)
 * - Theme Provider (next-themes for dark/light mode)
 * - Toast Notifications (react-toastify)
 */
export default function RootProvider({ children }: RootProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CartInitializer />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}

            {/* Toast Notifications */}
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />

            {/* React Query DevTools - Only in Development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}
