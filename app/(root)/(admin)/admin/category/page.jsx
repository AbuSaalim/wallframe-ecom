'use client'

import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  ADMIN_CATEGORY_EDIT,
  ADMIN_CATEGORY_ADD, 
  ADMIN_CATEGORY_SHOW, 
  ADMIN_DASHBOARD, 
  ADMIN_TRASH 
} from "@/routes/AdminPanelRoute"
import { FiFilePlus } from "react-icons/fi"  
import Link from "next/link"
import DataTableWrapper from "@/components/Application/Admin/DataTableWrapper"
import { useCallback, useMemo } from "react"
import { DT_CATEGORY_COLUMN } from "@/lib/column"
import EditAction from "@/components/Application/Admin/EditAction"
import DeleteAction from "@/components/Application/Admin/DeleteAction"

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
]

const ShowCategory = () => {

  // Define columns
  const columns = useMemo(() => DT_CATEGORY_COLUMN, [])

  // Define action menu
  const createAction = useCallback((row, deleteType, handleDelete) => {
    const actionMenu = []
    
    actionMenu.push(
      <EditAction 
        key="Edit" 
        href={ADMIN_CATEGORY_EDIT(row.original._id)} 
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
            <h4 className="text-xl font-semibold">Show Category</h4>
            <Button asChild>
              <Link href={ADMIN_CATEGORY_ADD}>
                <FiFilePlus className="mr-2" />
                New Category
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          <DataTableWrapper 
            queryKey="category-data"
            fetchUrl="/api/category" 
            initialPageSize={10}
            columnsConfig={columns}
            exportEndPoint="/api/category/export"
            deleteEndPoint="/api/category/delete"
            deleteType="SD"
            trashView={`${ADMIN_TRASH}?trashof=category`}
            createAction={createAction}
          />
        </CardContent>
      </Card>
    </div>
  ) 
}

export default ShowCategory
