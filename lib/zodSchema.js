import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  name: z
    .string()
    .min(1, { message: "Full name is required" })
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(50, { message: "Full name must not exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { 
      message: "Full name can only contain letters and spaces" 
    }),
  otp: z.string()
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
    .length(6, 'OTP must be 6 characters long'),

  _id: z.string().min(3, '_id is required'),
  alt: z.string().min(3, 'alt is required'),
  title: z.string().min(3, 'title is required'),
  slug: z.string().min(3, 'Slug is Required.'),
  category: z.string().min(3, 'Category is required.'),

  // Product fields - unlimited discount
  mrp: z.coerce
    .number({ invalid_type_error: 'MRP must be a number' })
    .positive('MRP must be positive.'),

  sellingPrice: z.coerce
    .number({ invalid_type_error: 'Selling price must be a number' })
    .positive('Selling price must be positive.'),

  // Product discount - unlimited
  discountPercentage: z.coerce
    .number({ invalid_type_error: 'Discount must be a number' })
    .min(0, 'Discount cannot be negative.'),

  description: z.string().min(3, 'Description is Required'),
  media: z.array(z.string()),

  // Product Variant fields
  product: z.string().min(3, 'Product is required.'),
  color: z.string().min(3, 'Color is required.'),
  size: z.string().min(1, 'Size is required.'),
  sku: z.string().min(1, 'SKU is required.'),

  // Coupon fields
  code: z.string().min(1, 'Code is required.'),
  minimumShoppingAmount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Minimum shopping amount cannot be negative.'),
  validity: z.coerce.date(),
});
