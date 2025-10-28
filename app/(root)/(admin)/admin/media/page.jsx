import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
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
    </div>
  )
}

export default MediaPage
