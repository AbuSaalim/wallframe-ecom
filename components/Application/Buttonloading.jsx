import React from 'react'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const Buttonloading = ({type,text,loading,className, onClick, ...props}) => {
  return (
    <Button type={type} disabled={loading}
    className={cn("", className)}
    onClick={onClick} {...props}> 
    {
        loading && 
        <Loader2 className='animate-spin' />
    }
        {text}
    </Button>
  )
}

export default Buttonloading


