'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '@/store/reducer/cartStore'
import CartItem from '@/components/Application/Website/CartItem'

export default function CartPage() {
  const dispatch = useDispatch()
  const { items, totalItems, totalPrice } = useSelector((store: any) => store.cartStore)

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart())
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container px-4 md:px-6 lg:px-12 mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild variant="default" size="lg" className="rounded-full">
              <Link href="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6 lg:px-12 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/shop" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear Cart
                </Button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item: any) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    Calculated at checkout
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button asChild variant="default" size="lg" className="w-full rounded-full mb-3">
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                <Link href="/shop">
                  Continue Shopping
                </Link>
              </Button>

              {/* Trust Signals */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free shipping on orders over ₹2,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Easy returns within 30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
