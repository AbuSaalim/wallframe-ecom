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
  slug:z.string().min(3,'Slug is Required.'),
  category:z.string().min(3, 'Category is required.'),

  mrp:z.union([
    z.number()
.positive('Expected positive value, recived nwgative.'),
z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, 'Please enter a valid number.')
  ]),

  sellingPrice:z.union([
    z.number()
.positive('Expected positive value, recived nwgative.'),
z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, 'Please enter a valid number.')
  ]),

  discountPercentage:z.union([
    z.number()
.positive('Expected positive value, recived nwgative.'),
z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, 'Please enter a valid number.')
  ]),

description:z.string().min(3, 'Description is Required'),
media: z.array(z.string())

});


