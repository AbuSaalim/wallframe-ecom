'use client'

import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  ADMIN_DASHBOARD, 
  ADMIN_COUPON_ADD, 
  ADMIN_COUPON_EDIT, 
  ADMIN_COUPON_SHOW, 
  ADMIN_TRASH 
} from "@/routes/AdminPanelRoute"
import { FiFilePlus } from "react-icons/fi"  
import Link from "next/link"
import DataTableWrapper from "@/components/Application/Admin/DataTableWrapper"
import { useCallback, useMemo } from "react"
import { DT_COUPON_COLUMN } from "@/lib/column"
import EditAction from "@/components/Application/Admin/EditAction"
import DeleteAction from "@/components/Application/Admin/DeleteAction"

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_COUPON_SHOW, label: 'Coupon' },
]

const ShowCoupon = () => {

  // Define columns
  const columns = useMemo(() => DT_COUPON_COLUMN, [])

  // Define action menu
  const createAction = useCallback((row, deleteType, handleDelete) => {
    const actionMenu = []
    
    actionMenu.push(
      <EditAction 
        key="Edit" 
        href={ADMIN_COUPON_EDIT(row.original._id)} 
      />
    )
    
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
            <h4 className="text-xl font-semibold">Show Coupons</h4>
            <Button asChild>
              <Link href={ADMIN_COUPON_ADD}>
                <FiFilePlus className="mr-2" />
                New Coupon
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          <DataTableWrapper 
            queryKey="coupon-data"
            fetchUrl="/api/coupon" 
            initialPageSize={10}
            columnsConfig={columns}
            exportEndPoint="/api/coupon/export"
            deleteEndPoint="/api/coupon/delete"
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=coupon`}
            createAction={createAction}
          />
        </CardContent>
      </Card>
    </div>
  ) 
}

export default ShowCoupon
