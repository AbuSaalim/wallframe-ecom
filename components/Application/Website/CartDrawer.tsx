'use client'

import React from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useSelector, useDispatch } from 'react-redux'
import { toggleDrawer } from '@/store/reducer/cartStore'
import CartItem from './CartItem'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { items, totalItems, totalPrice, isDrawerOpen } = useSelector((store: any) => store.cartStore)

  const handleClose = () => {
    dispatch(toggleDrawer(false))
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => dispatch(toggleDrawer(open))}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Add some products to get started
              </p>
              <Button asChild variant="default" size="sm" className="">
                <Link href="/shop" onClick={handleClose}>
                  Continue Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item: any) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Subtotal</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>

            <p className="text-xs text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button asChild variant="default" size="lg" className="w-full">
                <Link href="/cart" onClick={handleClose}>
                  View Cart
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/checkout" onClick={handleClose}>
                  Checkout
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
