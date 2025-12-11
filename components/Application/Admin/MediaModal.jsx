import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { Fragment, useState } from 'react'
import Image from 'next/image'
import loading from '@/public/assets/images/loading.svg'
import ModalMediaBlock from './ModalMediaBlock'
import { showToast } from '@/lib/showToast'


const MediaModal = ({open, setOpen, selectedMedia, setSelectedMedia, isMultiple}) => {

    const [previouslySelected, setPreviouslySelected] = useState([])

    const fetchMedia = async ({pageParam = 0}) => {
        const {data: response} = await axios.get(`/api/media?page=${pageParam}&&limit=18&&deleteType=SD`)
        return response
    }

    const {
        data,
        isPending,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['MediaModal'],
        queryFn: fetchMedia,
        placeholderData: keepPreviousData,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length : undefined
        }
    })

    const handleClear = () => {
        setSelectedMedia([])
        setPreviouslySelected([])
        showToast('success','Media selection cleared.')
    }

    const handleClose = () => {
        setSelectedMedia(previouslySelected)
        setOpen(false)
    }

    const handleSelect = () => {
        if (selectedMedia.length <= 0) {
            return showToast('error', 'Please select a media.')
        }

        setPreviouslySelected(selectedMedia)
        setOpen(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => setOpen(!open)}
        >
            <DialogContent 
                onInteractOutside={(e) => e.preventDefault()}
                className="w-full sm:max-w-[95vw] h-screen p-0 py-10 bg-transparent border-0 shadow-none"
            >
                <DialogDescription className="hidden"></DialogDescription>

                <div className="h-[90vh] w-full bg-white p-3 rounded shadow">
                    <DialogHeader className="h-8 border-b">
                        <DialogTitle>Media Selection</DialogTitle>
                    </DialogHeader>

                    <div className="h-[calc(100%-80px)] overflow-auto py-2">
                        {isPending ? (
                            <div className="flex justify-center items-center h-full">
                                <Image src={loading} alt='loading' height={80} width={80} />
                            </div>
                        ) : isError ? (
                            <div className="flex justify-center items-center h-full">
                               <span className='text-red-500'>{error.message}</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {
                                        data?.pages?.map((pages, index) => (
                                            <Fragment key={index}>
                                                {
                                                    pages?.mediaData?.map((media) => (
                                                        <ModalMediaBlock
                                                            key={media._id}
                                                            media={media}
                                                            selectedMedia={selectedMedia}
                                                            setSelectedMedia={setSelectedMedia}
                                                            isMultiple={isMultiple}
                                                        />
                                                    ))
                                                }
                                            </Fragment>
                                        ))
                                    }
                                </div>
                                
                                {hasNextPage && (
                                    <div className="flex justify-center mt-4">
                                        <Button 
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            variant="outline"
                                        >
                                            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="h-10 pt-3 border-t flex justify-between">
                        <div>
                            <Button className="cursor-pointer" type="button" variant="destructive" onClick={handleClear}>
                                Clear All
                            </Button>
                        </div>
                        <div className='flex gap-5'>
                            <Button className="cursor-pointer" type="button" variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                      
                            <Button className="cursor-pointer" type="button" onClick={handleSelect}>
                                Select
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MediaModal
