import { createSlice } from '@reduxjs/toolkit'
import { showToast } from '@/lib/showToast'

const initialState = {
  items: [], // Wishlist mein jo products honge wo yahan aayenge
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload
      const existingIndex = state.items.findIndex((item: any) => item._id === product._id)

      if (existingIndex >= 0) {
        // Agar pehle se hai, toh remove kar do
        state.items.splice(existingIndex, 1)
        showToast('success', 'Removed from Wishlist')
      } else {
        // Agar nahi hai, toh add kar do
        state.items.push(product)
        showToast('success', 'Added to Wishlist ❤️')
      }
    },
  },
})

export const { toggleWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer