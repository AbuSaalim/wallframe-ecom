import React from 'react'
import { BsCart2 } from 'react-icons/bs'

const Cart = () => {
  return (
    <div>
      <button type='button'>
        <BsCart2 size={25} className='text-gray-500 hover:text-gray-primary cursor-pointer' />
      </button>
    </div>
  )
}

export default Cart
