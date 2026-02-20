"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import BreadCrumb from "@/components/Application/Admin/BreadCrumb";
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_SHOW } from "@/routes/AdminPanelRoute";
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
import Select from "@/components/Application/Select";
import MediaModal from "@/components/Application/Admin/MediaModal";
import Image from "next/image";
import { sizes } from "@/lib/utils";

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: "Product Variants" },
  { href: "", label: "Add Product Variants" },
];

const AddProductVariant = () => {
  const [loading, setLoading] = useState(false);
  const [productOption, setProductOption] = useState([]);
  
  // ✅ FIXED: Fetch products, not categories
  const { data: getProduct } = useFetch("/api/product?deleteType=SD&size=10000");

  // media modal state
  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  useEffect(() => {
    if (getProduct && getProduct.success) {
      const data = getProduct.data;
      const options = data.map((product) => ({
        label: product.name,
        value: product._id,
      }));
      setProductOption(options);
    }
  }, [getProduct]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const formSchema = LoginSchema.pick({
    product: true,
    sku: true,
    color: true,
    size: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: "",
      sku: "",
      color: "",
      size: "",
      mrp: 0,              // ✅ FIXED: Changed to number
      sellingPrice: 0,      // ✅ FIXED: Changed to number
      discountPercentage: 0, // ✅ FIXED: Changed to number
    },
  });

  // ✅ FIXED: Discount percentage calculator with infinite loop prevention
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      // Only calculate when mrp or sellingPrice changes
      if (fieldName === 'mrp' || fieldName === 'sellingPrice') {
        const mrp = parseFloat(value.mrp) || 0;
        const sellingPrice = parseFloat(value.sellingPrice) || 0;

        if (mrp > 0 && sellingPrice > 0 && sellingPrice < mrp) {
          const discountPercentage = ((mrp - sellingPrice) / mrp) * 100;
          const roundedDiscount = Math.round(discountPercentage);
          
          // Only update if value changed
          if (form.getValues('discountPercentage') !== roundedDiscount) {
            form.setValue('discountPercentage', roundedDiscount, {
              shouldValidate: false,
              shouldDirty: false,
              shouldTouch: false
            });
          }
        } else if (mrp > 0 && sellingPrice >= mrp) {
          if (form.getValues('discountPercentage') !== 0) {
            form.setValue('discountPercentage', 0, {
              shouldValidate: false,
              shouldDirty: false,
              shouldTouch: false
            });
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      if (selectedMedia.length <= 0) {
        showToast('error', 'Please select media.');
        setLoading(false);
        return;
      }

      const mediaIds = selectedMedia.map(media => media._id);
      values.media = mediaIds;

      console.log('Submitting values:', values);

      const { data: response } = await apiClient.post(
        "/api/product-variant/create",
        values
      );

      if (!response.success) {
        throw new Error(response.message);
      }

      queryClient.invalidateQueries({ queryKey: ["product-variant-data"] });

      form.reset();
      setSelectedMedia([]);
      showToast("success", response.message);

      setTimeout(() => {
        router.push(ADMIN_PRODUCT_VARIANT_SHOW);
      }, 1000);
    } catch (error) {
      showToast("error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">New Variant</h4>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6 grid md:grid-cols-2 gap-5">

                {/* ✅ FIXED: Changed name from "category" to "product" */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Product <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            options={productOption}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SKU */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          SKU <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter product SKU (e.g., SKU-12345)"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Color */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Color <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter color"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Size */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Size <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            options={sizes.map(size => ({ label: size, value: size }))}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* MRP - ✅ FIXED: Convert to number */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="mrp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          MRP <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter MRP"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Selling Price - ✅ FIXED: Convert to number */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Selling Price <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter Selling Price"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Discount Percentage */}
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Discount Percentage{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            readOnly
                            placeholder="Auto-calculated"
                            {...field}
                            disabled={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>

              <div className="md:col-span-2 border-dashed rounded p-5 text-center mt-5">
                <MediaModal 
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />

                {selectedMedia.length > 0 && (
                  <div className="flex justify-center items-center flex-wrap mb-3 gap-2">
                    {selectedMedia.map(media => (
                      <div key={media._id} className="h-24 w-24 border relative group">
                        <Image 
                          src={media.url}
                          height={100}
                          width={100}
                          alt=""
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedMedia(prev => prev.filter(m => m._id !== media._id))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div onClick={() => setOpen(true)} className="bg-gray-50 dark:bg-card border w-[200px] mx-auto p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-semibold">Select Media</span>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <Buttonloading
                  loading={loading}
                  type="submit"
                  text="Add Product Variant"
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

export default AddProductVariant;
