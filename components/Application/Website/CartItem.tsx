'use client'

import React from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDispatch } from 'react-redux'
import { removeFromCart, updateQuantity } from '@/store/reducer/cartStore'
import { CartItem as CartItemType } from '@/lib/cart/localStorage'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const dispatch = useDispatch()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > item.stock) {
      // Show toast or alert
      return
    }
    dispatch(updateQuantity({ itemId: item.id, quantity: newQuantity }))
  }

  const handleRemove = () => {
    dispatch(removeFromCart(item.id))
  }

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={item.image || '/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {item.name}
        </h4>
        
        {/* Variant Info */}
        {(item.color || item.size) && (
          <div className="flex gap-2 mt-1 text-xs text-gray-500">
            {item.color && <span>Color: {item.color}</span>}
            {item.size && <span>Size: {item.size}</span>}
          </div>
        )}

        {/* Price */}
        <p className="mt-1 text-sm font-semibold text-gray-900">
          ₹{item.price.toLocaleString()}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="text-sm font-medium w-8 text-center">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-600"
        onClick={handleRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
