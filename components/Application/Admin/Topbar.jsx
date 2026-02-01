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
    <div className='fixed top-0 left-0 right-0 h-14 z-30 border-b px-4 sm:px-6 md:px-8 flex justify-between items-center bg-white dark:bg-card'>
      
      <div>
        search components
      </div>
      <div className='flex items-center gap-2'>
        <ThemeSwitch/>
        <UserDropdown/>
        <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden" aria-label="Open menu"> 
            <RiMenu4Fill/>
        </Button>
        
      </div>
    </div>
  )
}

export default Topbar
