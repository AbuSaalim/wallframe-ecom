"use client"

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/store/reducer/authReducer'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { useRouter } from 'next/navigation'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'
import { Button } from '@/components/ui/button'
import { LogOut, User, Package, Heart, CreditCard, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toggleWishlist } from '@/store/reducer/wishlistReducer' // Import wishist action

const MyAccount = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const auth = useSelector((store: any) => store.authStore?.auth)
  
  // Wishlist ka data Redux se la rahe hain
  const wishlistItems = useSelector((store: any) => store.wishlistStore?.items || [])

  // Kaunsa tab active hai uska state
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      dispatch(logout())
      showToast('success', 'Logged out successfully')
      router.push(WEBSITE_HOME())
    } catch (error) {
      showToast('error', 'Logout failed')
    }
  }

  if (!auth) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <p className="text-xl mb-4">Please login to view your account.</p>
        <Button onClick={() => router.push('/auth/login')}>Login Now</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh] bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 font-serif">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {auth.photoURL ? (
                  <img src={auth.photoURL} alt={auth.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 line-clamp-1">{auth.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{auth.email}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 w-full p-3 rounded-md transition-colors text-left text-sm ${activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 w-full p-3 rounded-md transition-colors text-left text-sm ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Package className="w-4 h-4" /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center justify-between w-full p-3 rounded-md transition-colors text-left text-sm ${activeTab === 'wishlist' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" /> Wishlist
                </div>
                {/* Wishlist item count */}
                {wishlistItems.length > 0 && (
                  <span className={`text-xs py-0.5 px-2 rounded-full ${activeTab === 'wishlist' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            </nav>

            <Button variant="outline" className="w-full mt-8 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 min-h-[400px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Welcome back!</h2>
                <p className="text-gray-600">From your account dashboard you can view your recent orders, manage your wishlist, and edit your profile details.</p>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Order History</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No orders found.</p>
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Wishlist</h2>
                
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                    <Button asChild variant="outline"><Link href="/shop">Explore Shop</Link></Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((product: any) => (
                      <div key={product._id} className="group relative border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-gray-50 rounded-md overflow-hidden mb-3">
                          <Image src={product.media?.[0]?.secure_url || '/placeholder.png'} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <h3 className="font-serif font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                        <p className="text-primary font-semibold text-sm">₹{product.sellingPrice}</p>
                        
                        {/* Remove from wishlist button */}
                        <button 
                          onClick={() => dispatch(toggleWishlist(product))}
                          className="absolute top-5 right-5 w-8 h-8 bg-white/90 shadow-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount