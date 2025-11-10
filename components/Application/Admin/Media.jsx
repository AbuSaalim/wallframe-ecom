import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ADMIN_MEDIA_EDIT } from '@/routes/AdminPanelRoute';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { FaLink } from "react-icons/fa6";
import { LuTrash } from "react-icons/lu";
import { showToast } from '@/lib/showToast';

const Media = ({media, handleDelete, deleteType, selectedMedia, setSelectedMedia}) => {
  const handleCheck = () => {
    let newSelectedMedia = []
    if (selectedMedia.includes(media._id)) {
        newSelectedMedia = selectedMedia.filter(m => m !== media._id)
    } else {
        newSelectedMedia = [...selectedMedia, media._id]
    }

    setSelectedMedia(newSelectedMedia) // Changed from selectedMedia to setSelectedMedia
  }

  const handleCopylink = async (url) => {
    await navigator.clipboard.writeText(url)
    showToast('success', 'Link copied.')
  }

  return (
    <div className='border border-gray-200 dark:border-gray-800 relative group rounded overflow-hidden'>
      <div className='absolute top-2 left-2 z-20'>
        <Checkbox
          checked={selectedMedia.includes(media._id)} 
          onCheckedChange={handleCheck} 
          className="border-primary cursor-pointer"
        />
      </div>

      <div className='absolute top-2 right-2 z-20'>
        <DropdownMenu>
          <DropdownMenuTrigger className='p-1 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
            <span className='w-7 h-7 flex items-center justify-center rounded-full bg-black/50 cursor-pointer'>
              <BsThreeDotsVertical className='text-white'/>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
           {
            deleteType === 'SD' && (
             <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={ADMIN_MEDIA_EDIT(media._id)}>
                    <MdModeEdit/> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopylink(media.secure_url)}> 
                  <FaLink/> Copy Link 
                </DropdownMenuItem>
             </>
            ) 
           }

             <DropdownMenuItem className="cursor-pointer" onClick={() => handleDelete([media._id], deleteType)}> 
                <LuTrash color='red'/> {deleteType === 'SD' ? 'Move Into Trash' : 'Delete Permanently'} 
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full h-full absolute z-10 transition-all duration-150 ease-in group-hover:bg-black/30">
      </div>

      <div className='relative w-full h-[150px] sm:h-[200px]'>
        <Image 
          src={media.secure_url || media.thumbnail_url} 
          alt={media.alt || 'Media image'} 
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className='object-cover'
        />
      </div>
    </div>
  )
}

export default Media
