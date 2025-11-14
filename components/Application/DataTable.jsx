'use client'

import { IconButton, Tooltip } from '@mui/material'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { 
  MaterialReactTable, 
  MRT_ShowHideColumnsButton, 
  MRT_ToggleDensePaddingButton, 
  MRT_ToggleFullScreenButton, 
  MRT_ToggleGlobalFilterButton, 
  useMaterialReactTable 
} from 'material-react-table'
import Link from 'next/link'
import React, { useState } from 'react'
import RecyclingIcon from '@mui/icons-material/Recycling';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import useDeleteMutaion from '@/hooks/useDeleteMutation'
import Buttonloading from './Buttonloading';
import { showToast } from '@/lib/showToast'
import { download, generateCsv, mkConfig } from 'export-to-csv'

const DataTable = ({
  queryKey,
  fetchUrl,
  columnsConfig = [],
  initialPageSize = 10,
  exportEndPoint,
  deleteEndPoint,
  deleteType,
  trashView,
  createAction
}) => {

  // Filter, sorting and pagination states
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize
  })

  // Row selection State
  const [rowSelection, setRowSelection] = useState({})

  // Export loading State
  const [exportLoading, setExportLoading] = useState(false);

  // Handle delete method
  const deleteMutation = useDeleteMutaion(queryKey, deleteEndPoint)

  // Delete Method
  const handleDelete = (ids, deleteType) => {
    let c
    if (deleteType === 'PD') {
      c = confirm('Are you sure you want to delete the data permanently?')
    } else {
      c = confirm('Are you sure you want to move data into trash?')
    }
    if (c) {
      deleteMutation.mutate({ ids, deleteType })
      setRowSelection({})
    }
  }

  // Handle Export Method
  const handleExport = async (selectedRows) => {
    try {
      setExportLoading(true);
      
      const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'csv-data'
      })

      let csv

      if (Object.keys(rowSelection).length > 0) {
        // Export only selected rows
        const rowData = selectedRows.map((row) => row.original)
        csv = generateCsv(csvConfig)(rowData)
      } else {
        // Export all data
        const { data: response } = await axios.get(exportEndPoint)
        if (!response.success) {
          throw new Error(response.message)
        }

        const rowData = response.data
        csv = generateCsv(csvConfig)(rowData)
      }

      download(csvConfig)(csv)
      showToast('success', 'Data exported successfully')
      
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', error.message || 'Failed to export data')
    } finally {
      setExportLoading(false)
    }
  }

  // Data fetching logic
  const {
    data: { data = [], meta = {} } = {},
    isError,
    isRefetching,
    isLoading
  } = useQuery({
    queryKey: [queryKey, { columnFilters, globalFilter, pagination, sorting }],
    queryFn: async () => {
      const url = new URL(
        fetchUrl, 
        process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      )
      
      url.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`);
      url.searchParams.set('size', `${pagination.pageSize}`);
      url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      url.searchParams.set('globalFilter', globalFilter ?? '');
      url.searchParams.set('sorting', JSON.stringify(sorting ?? []));
      url.searchParams.set('deleteType', deleteType);

      const { data: response } = await axios.get(url.href)

      return response
    },
    placeholderData: keepPreviousData,
  })

  // Initialize table
  const table = useMaterialReactTable({
    columns: columnsConfig,
    data,
    enableRowSelection: true,
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    enableColumnOrdering: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    initialState: { showColumnFilters: true },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,

    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: meta?.totalRowCount ?? 0,
    onRowSelectionChange: setRowSelection,
    
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      rowSelection
    },

    getRowId: (originalRow) => originalRow._id,
    
    renderToolbarInternalActions: ({ table }) => (
      <>
        {/* Built-in buttons */}
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />

        {/* Recycle Bin - Show for soft delete */}
        {deleteType !== 'PD' && trashView && (
          <Tooltip title="Recycle Bin">
            <Link href={trashView}>
              <IconButton>
                <RecyclingIcon />
              </IconButton>
            </Link>
          </Tooltip>
        )}

        {/* Delete All - Soft delete */}
        {deleteType === 'SD' && (
          <Tooltip title="Delete Selected">
            <span>
              <IconButton 
                disabled={!table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} 
                onClick={() => handleDelete(Object.keys(rowSelection), deleteType)}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {/* Restore and Permanent Delete - From trash */}
        {deleteType === 'PD' && (
          <>
            <Tooltip title="Restore Data">
              <span>
                <IconButton 
                  disabled={!table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} 
                  onClick={() => handleDelete(Object.keys(rowSelection), 'RSD')}
                >
                  <RestoreFromTrashIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Permanently Delete Data">
              <span>
                <IconButton 
                  disabled={!table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} 
                  onClick={() => handleDelete(Object.keys(rowSelection), deleteType)}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </>
    ),
    
    enableRowActions: createAction ? true : false,
    positionActionsColumn: 'last',
    renderRowActionMenuItems: createAction 
      ? ({ row }) => createAction(row, deleteType, handleDelete)
      : undefined,

    renderTopToolbarCustomActions: ({ table }) => (
      <Tooltip title="Export Data">
        <span>
          <Buttonloading 
            type="button" 
            text={
              <>
                <SaveAltIcon fontSize='25' className="mr-2" /> 
                Export
              </>
            }
            loading={exportLoading}
            disabled={!exportEndPoint}
            onClick={() => handleExport(table.getSelectedRowModel().rows)}
            className="cursor-pointer"
          />
        </span>
      </Tooltip>
    )
  })

  return <MaterialReactTable table={table} />
}

export default DataTable
