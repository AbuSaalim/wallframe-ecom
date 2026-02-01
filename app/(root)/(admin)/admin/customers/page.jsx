'use client'

import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  ADMIN_DASHBOARD,   
  ADMIN_TRASH 
} from "@/routes/AdminPanelRoute"
import {DT_CUSTOMER_COLUMN} from "@/lib/column"
import DataTableWrapper from "@/components/Application/Admin/DataTableWrapper"
import { useCallback, useMemo } from "react"
import DeleteAction from "@/components/Application/Admin/DeleteAction"

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Customers' },
]

const ShowCustomer = () => {

  // Define columns
  const columns = useMemo(() => DT_CUSTOMER_COLUMN, [])


  // Define action menu
  const createAction = useCallback((row, deleteType, handleDelete) => {
    const actionMenu = []
    
    actionMenu.push(
      <DeleteAction 
        key="Delete" 
        handleDelete={handleDelete} 
        row={row} 
        deleteType={deleteType} 
      />
    )
    
    return actionMenu
  }, [])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm gap-0">
        <CardHeader className="px-3 py-3 border-b border-border">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">Customers</h4>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          <DataTableWrapper 
            queryKey="customers-data"
            fetchUrl="/api/customers" 
            initialPageSize={10}
            columnsConfig={columns}
            exportEndPoint="/api/customers/export"
            deleteEndPoint="/api/customers/delete"
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=customers`}
            createAction={createAction}
          />
        </CardContent>
      </Card>
    </div>
  ) 
}

export default ShowCustomer
