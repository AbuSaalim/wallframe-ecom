'use client'

import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ADMIN_DASHBOARD, ADMIN_TRASH } from "@/routes/AdminPanelRoute"
import DataTableWrapper from "@/components/Application/Admin/DataTableWrapper"
import { useCallback, useMemo } from "react"
import { DT_CATEGORY_COLUMN, DT_COUPON_COLUMN, DT_CUSTOMER_COLUMN, DT_PRODUCT_COLUMN, DT_PRODUCT_VARIANT_COLUMN } from "@/lib/column"
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import { useSearchParams } from "next/navigation"
import { columnConfig } from "@/lib/helperFunction"

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_TRASH, label: 'Trash' },
]

const TRASH_CONFIG = {
  category: {
    title: 'Category Trash',
    columns: DT_CATEGORY_COLUMN,
    fetchUrl: '/api/category',
    exportUrl: '/api/category/export',
    deleteUrl: '/api/category/delete'
  },
  product: {
    title: 'Product Trash',
    columns: DT_PRODUCT_COLUMN,
    fetchUrl: '/api/product',
    exportUrl: '/api/product/export',
    deleteUrl: '/api/product/delete'
  },
  "product-variant": {
    title: 'Product Variant Trash',
    columns: DT_PRODUCT_VARIANT_COLUMN,
    fetchUrl: '/api/product-variant',
    exportUrl: '/api/product-variant/export',
    deleteUrl: '/api/product-variant/delete'
  },
  coupon: {
    title: 'Coupon Trash',
    columns: DT_COUPON_COLUMN,
    fetchUrl: '/api/coupon',
    exportUrl: '/api/coupon/export',
    deleteUrl: '/api/coupon/delete'
  },
  customers: {
    title: 'Customers Trash',
    columns: DT_CUSTOMER_COLUMN,
    fetchUrl: '/api/customers',
    exportUrl: '/api/customers/export',
    deleteUrl: '/api/customers/delete'
  },
}

const Trash = () => {
  const searchParams = useSearchParams();
  const trashOf = searchParams.get('trashof');  // ✅ Fixed typo: 'trashf' → 'trashof'

  const config = TRASH_CONFIG[trashOf];

  // Handle invalid or missing trashof parameter
  if (!config) {
    return (
      <div>
        <BreadCrumb breadcrumbData={breadcrumbData} />
        <Card className="py-0 rounded shadow-sm gap-0">
          <CardHeader className="px-3 py-3 border-b border-border">
            <h4 className="text-xl font-semibold">Trash</h4>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-gray-500">Invalid trash type. Please select a valid category.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Define columns
  const columns = useMemo(() => {
    return columnConfig(config.columns, false, false, true);
  }, [config]);  // ✅ Added dependency

  // Define action menu
  const createAction = useCallback((row, deleteType, handleDelete) => {
    return [
      <DeleteAction 
        key="Delete" 
        handleDelete={handleDelete} 
        row={row} 
        deleteType={deleteType} 
      />
    ];
  }, []);

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm gap-0">
        <CardHeader className="px-3 py-3 border-b border-border">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">{config.title}</h4>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          <DataTableWrapper 
            queryKey={`${trashOf}-data-deleted`}
            fetchUrl={config.fetchUrl}
            initialPageSize={10}
            columnsConfig={columns}
            exportEndPoint={config.exportUrl}
            deleteEndPoint={config.deleteUrl}
            deleteType="PD"
            createAction={createAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Trash;
