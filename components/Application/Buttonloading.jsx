import React from 'react'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Yahan loadingText aur text dono ko destructure kar liya taaki error na aaye
const Buttonloading = ({ type = "button", text, loadingText, loading = true, className, onClick, ...props }) => {
  return (
    <Button 
      type={type} 
      disabled={loading}
      className={cn("flex items-center justify-center gap-2", className)}
      onClick={onClick} 
      {...props}
    > 
      {loading && <Loader2 className='h-4 w-4 animate-spin' />}
      
      {/* Agar loadingText bheja hai toh wo dikhega, warna text dikhega */}
      {loadingText || text || "Please wait..."}
    </Button>
  )
}

export default Buttonloading