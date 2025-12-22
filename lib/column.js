export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
]

export const DT_PRODUCT_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Product',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
            const category = row.getValue("category");
            return <div>{category?.name || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
        cell: ({ row }) => (
            <div>₹{row.getValue("mrp")}</div>
        ),
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        cell: ({ row }) => (
            <div>₹{row.getValue("sellingPrice")}</div>
        ),
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount %',
        cell: ({ row }) => (
            <div>{row.getValue("discountPercentage")}%</div>
        ),
    },
]

export const DT_PRODUCT_VARIANT_COLUMN = [
    {
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }) => {
            const product = row.getValue("product");
            return <div>{product?.name || 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'color',
        header: 'Color',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
        cell: ({ row }) => (
            <div>₹{row.getValue("mrp")}</div>
        ),
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        cell: ({ row }) => (
            <div>₹{row.getValue("sellingPrice")}</div>
        ),
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount %',
        cell: ({ row }) => (
            <div>{row.getValue("discountPercentage")}%</div>
        ),
    },
]

// ✅ NEW COUPON COLUMN
export const DT_COUPON_COLUMN = [
    {
        accessorKey: 'code',
        header: 'Coupon Code',
        cell: ({ row }) => (
            <div className="font-medium uppercase">{row.getValue("code")}</div>
        ),
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount %',
        cell: ({ row }) => (
            <div className="text-green-600 font-semibold">{row.getValue("discountPercentage")}%</div>
        ),
    },
    {
        accessorKey: 'minimumShoppingAmount',
        header: 'Min Amount',
        cell: ({ row }) => (
            <div>₹{row.getValue("minimumShoppingAmount")}</div>
        ),
    },
    {
        accessorKey: 'validity',
        header: 'Valid Until',
        cell: ({ row }) => {
            const date = new Date(row.getValue("validity"));
            const isExpired = date < new Date();
            return (
                <div className={isExpired ? 'text-red-500' : 'text-green-600'}>
                    {date.toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })}
                    {isExpired && <span className="ml-2 text-xs">(Expired)</span>}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div>{date.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })}</div>;
        },
    },
]
