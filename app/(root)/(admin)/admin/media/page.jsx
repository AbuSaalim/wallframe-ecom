import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import UploadMedia from '@/components/Application/Admin/UploadMedia'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import React from 'react'

const breadcrumbData = [
    {href: ADMIN_DASHBOARD, label: 'Home'},
    {href:'', label: 'Media'}
]

const MediaPage = () => {



  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData}/>


        <UploadMedia />
    </div>
  )
}

export default MediaPage
