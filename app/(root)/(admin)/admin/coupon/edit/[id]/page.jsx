"use client";

import { use, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import BreadCrumb from "@/components/Application/Admin/BreadCrumb";
import { ADMIN_COUPON_SHOW, ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Buttonloading from "@/components/Application/Buttonloading";
import { LoginSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { showToast } from "@/lib/showToast";
import apiClient from "@/lib/apiClient";
import useFetch from "@/hooks/useFetch";
import { z } from "zod";

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_COUPON_SHOW, label: "Coupon" },
  { href: "", label: "Edit Coupon" },
];

const EditCoupon = ({ params }) => {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: getCoupon, loading: getCouponLoading } = useFetch(`/api/coupon/get/${id}`);

  // ✅ Extend schema with 0-100% validation for coupons
  const formSchema = LoginSchema.pick({
    code: true,
    minimumShoppingAmount: true,
    validity: true,
  }).extend({
    discountPercentage: z.coerce
      .number({ invalid_type_error: 'Discount must be a number' })
      .min(0, 'Discount cannot be negative.')
      .max(100, 'Please enter a valid discount between 0-100.'),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      discountPercentage: 0,
      minimumShoppingAmount: 0,
      validity: "",
    },
  });

  // Populate form when coupon data loads
  useEffect(() => {
    if (getCoupon && getCoupon.success && getCoupon.data) {
      const coupon = getCoupon.data;

      console.log('Coupon Data:', coupon);

      // Format date for input[type="date"]
      const formattedDate = coupon.validity 
        ? new Date(coupon.validity).toISOString().split('T')[0] 
        : '';

      form.reset({
        code: coupon.code || "",
        discountPercentage: coupon.discountPercentage || 0,
        minimumShoppingAmount: coupon.minimumShoppingAmount || 0,
        validity: formattedDate,
      });
    }
  }, [getCoupon, form]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        _id: id,
      };

      console.log('Submitting payload:', payload);

      const { data: response } = await apiClient.put(
        "/api/coupon/update",
        payload
      );

      if (!response.success) {
        throw new Error(response.message);
      }

      queryClient.invalidateQueries({ queryKey: ["coupon-data"] });

      showToast("success", response.message);

      setTimeout(() => {
        router.push(ADMIN_COUPON_SHOW);
      }, 1000);
    } catch (error) {
      showToast("error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (getCouponLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!getCoupon || !getCoupon.success) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-red-500">Coupon not found</div>
      </div>
    );
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">Edit Coupon</h4>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6 grid md:grid-cols-2 gap-5">
                
                {/* Code */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter coupon code"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Discount Percentage - ✅ With 0-100% validation */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Discount Percentage (0-100){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="Enter Discount Percentage (0-100)"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Minimum Shopping Amount */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="minimumShoppingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Minimum Shopping Amount{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter Minimum Shopping Amount"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Validity */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="validity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Validity{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>

              {/* Submit button */}
              <div className="pt-4">
                <Buttonloading
                  loading={loading}
                  type="submit"
                  text="Update Coupon"
                  className="cursor-pointer"
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCoupon;
