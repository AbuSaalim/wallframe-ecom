"use client"

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/reducer/authReducer'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { useRouter } from 'next/navigation'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { LogOut, User, Package, Heart, CreditCard } from 'lucide-react'

const MyAccount = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const auth = useSelector((store: any) => store.authStore?.auth)

  const handleLogout = async () => {
    try {
      // Call logout API
      await axios.post('/api/auth/logout')
      
      // Dispatch logout to Redux
      dispatch(logout())
      
      showToast('success', 'Logged out successfully')
      
      // Redirect to home
      router.push(WEBSITE_HOME())
    } catch (error) {
      console.error('Logout error:', error)
      showToast('error', 'Logout failed')
    }
  }

  if (!auth) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please login to view your account.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {auth.photoURL ? (
                  <img 
                    src={auth.photoURL} 
                    alt={auth.displayName} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold">{auth.displayName || 'User'}</p>
                <p className="text-sm text-gray-500">{auth.email}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 text-left">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 text-left">
                <Package className="w-4 h-4" />
                Orders
              </button>
              <button className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 text-left">
                <Heart className="w-4 h-4" />
                Wishlist
              </button>
              <button className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 text-left">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </button>
            </nav>

            <Button 
              variant="destructive" 
              className="w-full mt-6 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
            <p className="text-gray-600">
              From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount
