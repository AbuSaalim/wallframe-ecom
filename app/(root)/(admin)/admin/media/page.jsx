"use client"

import { useState, Fragment, useEffect } from 'react'
import { Card, CardHeader } from '@/@/components/ui/card'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import UploadMedia from '@/components/Application/Admin/UploadMedia'
import { ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW } from '@/routes/AdminPanelRoute'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { CardContent } from '@/components/ui/card'
import Media from '@/components/Application/Admin/Media'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Label } from '@radix-ui/react-label'
import { Checkbox } from '@/components/ui/checkbox'

const breadcrumbData = [
    {href: ADMIN_DASHBOARD, label: 'Home'},
    {href:'', label: 'Media'}
]

const MediaPage = () => {
  const [deleteType, setDeleteType] = useState('SD')
  const [selectedMedia, setSelectedMedia] = useState([])
  const [selectAll,setSelectAll]= useState(false)
  const searchParams = useSearchParams()
  
  useEffect(()=> {
    if(searchParams){
      const trashOf = searchParams.get('trashof')
      setSelectedMedia([])
      if (trashOf) {
        setDeleteType('PD')
      }else {
        setDeleteType('SD')
      }
    }
  }, [searchParams])

  const fetchMedia = async (page, deleteType) => {
    const {data: response} = await axios.get(`/api/media?page=${page}&limit=10&deleteType=${deleteType}`)
    console.log(response);
    return response
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['media-data', deleteType],
    queryFn: async({pageParam}) => await fetchMedia(pageParam, deleteType),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const nextPages = pages.length
      return lastPage.hasMore ? nextPages : undefined
    },
  })

  console.log(data);
  

  const handleDelete = (selectedMedia, deleteType) => {

  }


  const handleSelectAll = () => {

  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData}/>

      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-xl uppercase">
              {deleteType === 'SD'? 'Media' : 'Media Trash'}
            </h4>
            <div className="flex items-center gap-5">
           {deleteType === 'SD' &&    <UploadMedia />}
              <div className='flex gap-3'>
                {deleteType === 'SD' ?
                <Button type="button" variant="destructive">
                  <Link href={`${ADMIN_MEDIA_SHOW}?trashof=media`}>
                  Trash</Link>
                </Button>

                :

              <Button type="button" >
                  <Link href={`${ADMIN_MEDIA_SHOW}`}>
                  Back To Media</Link>
                </Button>
                
                }
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>

                {selectedMedia.length > 0 && 
                <div className='py-2 px-3 bg-violet-200 rounded flex justify-between items-center'>
                    <Label>
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />

                      selectAll
                    </Label>
                    <div className='flex gap-2'>
                      {deleteType === 'SD'
                        ?
                        <Button variant="destructive" onClick={() => handleDelete(selectedMedia, deleteType)}>
                          Move Into Trash
                        </Button>
                        :
                        <>
                         <Button className="bg-green-500 hover:bg-green-600" onClick={() => handleDelete(selectedMedia, "RSD")}>
                          Restore
                        </Button>

                         <Button variant="destructive" onClick={() => handleDelete(selectedMedia, deleteType)}>
                          Delete Parmanently
                        </Button>
                        </>
                      }
                    </div>
                  </div>}

          {status === 'pending' ? 
            <div>Loading...</div>
            :
            status === 'error' ?
            <div className='text-red-500 text-sm'>{error.message}</div>
            :
            <div className='grid lg:grid-cols-5 sm:grid-cols-3 grid-cols-2 gap-2 mb-5'>
              {
                data?.pages?.map((pages, index) => (
                  <Fragment key={index}>
                    {
                      pages?.mediaData?.map((media) => (
                        <Media key={media._id}
                        media={media}
                        handleDelete={handleDelete}
                        deleteType={deleteType}
                        selectedMedia={selectedMedia}
                        setSelectedMedia={setSelectedMedia}
                        >

                        </Media>
                      ))
                    }
                  </Fragment>
                ))
              }
            </div>
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default MediaPage
