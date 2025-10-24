'use client'

import React from 'react'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import { Button } from '@/components/ui/button'
import { RiMenu4Fill } from "react-icons/ri";
import { useSidebar } from '@/components/ui/sidebar';


const Topbar = () => {

    const {toggleSidebar} = useSidebar()

  return (
    <div className='fixed border h-14 w-full top-0 left-0 z-30 px-5 md:ps-60 ps-71 flex justify-between items-center bg-white dark:bg-card'>
      
      <div>
        search components
      </div>
      <div className='flex items-center gap-2'>
        <ThemeSwitch/>
        <UserDropdown/>
        <Button onClick={toggleSidebar} type="button" size="icon" className="ms-2 md:hidden" aria-label="Open menu"> 
            <RiMenu4Fill/>
        </Button>
        
      </div>
    </div>
  )
}

export default Topbar
