'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { clearCart } from '@/store/reducer/cartStore'

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { items, totalPrice } = useSelector((store: any) => store.cartStore)
  const auth = useSelector((store: any) => store.authStore?.auth)

  const [loading, setLoading] = useState(false)
  
  // 🔥 Hydration Error Fix: Initial state empty rakhi hai
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    pincode: '',
  })

  // 🔥 Hydration Error Fix: Component mount hone ke baad user ka data fill karo
  useEffect(() => {
    if (auth) {
      setFormData(prev => ({
        ...prev,
        firstName: auth?.displayName?.split(' ')[0] || prev.firstName,
        lastName: auth?.displayName?.split(' ')[1] || prev.lastName,
        email: auth?.email || prev.email,
      }))
    }
  }, [auth])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("👉 1. Button Clicked!")

    if (!formData.firstName || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.pincode) {
      toast.error('Bhai, please fill all the required (*) details!')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty!')
      return
    }

    try {
      setLoading(true)

      const payload = {
        items: items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          sellingPrice: item.price,
        })),
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          streetAddress: formData.street,
          city: formData.city,
          pincode: formData.pincode,
        },
        paymentMethod: 'cod',
      }

      console.log("👉 2. Sending Payload:", payload)

      // 🔥 401 UNAUTHORIZED FIX: Aggressive Token Finder
      let token = auth?.token || auth?.accessToken || auth?.stsTokenManager?.accessToken;
      
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      }
      
      if (!token && typeof document !== 'undefined') {
        // Checking common cookie names for auth tokens
        const match = document.cookie.match(/(?:^|; )(token|accessToken|__session)=([^;]*)/);
        if (match) token = match[2];
      }

      console.log("👉 3. Extracted Token:", token ? "Token Found ✅" : "Token is EMPTY ❌")

      if (!token) {
        toast.error("Session expired or you are not logged in!")
        setLoading(false)
        return // Agar token nahi hai toh API hit hi mat karo
      }

      const response = await axios.post('/api/order', payload, {
        headers: {
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true 
      })
      
      console.log("👉 4. API Response:", response.data)

      if (response.data.success) {
        toast.success('Order Placed Successfully! 🎉')
        dispatch(clearCart())
        router.push('/my-account') // Redirect to orders page
      } else {
        toast.error(response.data.message || 'Something went wrong')
      }
    } catch (error: any) {
      console.error("❌ 5. Order API Error:", error)
      toast.error(error.response?.data?.message || 'Failed to place order. Check console.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button asChild><Link href="/shop">Go to Shop</Link></Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 lg:px-12 mx-auto">
        
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Billing & Shipping Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" placeholder="John" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" placeholder="john@example.com" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" placeholder="+91 98765 43210" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Street Address <span className="text-red-500">*</span></label>
                  <textarea name="street" value={formData.street} onChange={handleInputChange} className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" rows={3} placeholder="123 Main St, Apartment 4B..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
                    <input name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" placeholder="Mumbai" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Pincode <span className="text-red-500">*</span></label>
                    <input name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" className="w-full h-11 px-3 rounded-md border border-gray-200 focus:outline-none focus:border-primary transition-all" placeholder="400001" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              <div className="p-4 border border-primary bg-primary/5 rounded-md flex items-center gap-3">
                <input type="radio" id="cod" name="payment" defaultChecked className="w-4 h-4 text-primary" />
                <label htmlFor="cod" className="font-medium text-gray-900 cursor-pointer">Cash on Delivery (COD)</label>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-7">Pay with cash upon delivery.</p>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item: any, index: number) => (
                  <div key={`${item.productId}-${index}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 relative">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                         {item.quantity}
                       </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.color} {item.size ? `| ${item.size}` : ''}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (Estimated 18%)</span>
                  <span className="font-medium text-gray-900">₹{Math.round(totalPrice * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  {totalPrice > 500 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹50</span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{(totalPrice > 500 ? totalPrice + Math.round(totalPrice * 0.18) : totalPrice + Math.round(totalPrice * 0.18) + 50).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 text-base rounded-full">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : 'Place Order'}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>100% Secure & Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}