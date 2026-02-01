import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@mui/material";

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



//Customers column

export const DT_CUSTOMER_COLUMN = [
    {
  accessorKey: 'avatar',
  header: 'Avatar',
  cell: ({ row }) => {
    const avatar = row.original.avatar; // ✅ direct original data

    return (
      <Avatar
        src={avatar}
        alt="User"
        sx={{ width: 40, height: 40 }}
      />
    );
  }
},
    {
        accessorKey: 'name',
        header:'Name',
    },
    {
        accessorKey: 'email',
        header:'Email',
    },
    {
        accessorKey: 'phone',
        header:'Phone',
    },
    {
        accessorKey: 'address',
        header:'Address',
    },
    {
  accessorKey: 'isEmailVerified',
  header: 'Is Verified',
  cell: ({ row }) => {
    const isVerified = row.getValue('isEmailVerified');

    return isVerified ? (
      <Chip color="success" label="Verified" />
    ) : (
      <Chip color="error" label="Not Verified" />
    );
  }
}
    
]
//Review column

export const DT_REVIEW_COLUMN = [
    
    {
        accessorKey: 'product',
        header:'Product',
    },
    {
        accessorKey: 'user',
        header:'User',
    },
    {
        accessorKey: 'title',
        header:'Title',
    },
    {
        accessorKey: 'rating',
        header:'Rating',
    },
    {
        accessorKey: 'review',
        header:'Review',
    }
]
