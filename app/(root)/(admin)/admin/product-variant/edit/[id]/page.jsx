"use client";

import { use, useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import BreadCrumb from "@/components/Application/Admin/BreadCrumb";
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from "@/routes/AdminPanelRoute";
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
import axios from "axios";
import useFetch from "@/hooks/useFetch";
import Select from "@/components/Application/Select";
import dynamic from "next/dynamic";
import MediaModal from "@/components/Application/Admin/MediaModal";
import Image from "next/image";

const Editor = dynamic(() => import("@/components/Application/Admin/Editor"), {
  ssr: false,
});

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: "Home" },
  { href: ADMIN_PRODUCT_SHOW, label: "Products" },
  { href: "", label: "Edit Products" },
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const EditProduct = ({ params }) => {
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const [categoryOption, setCategoryOption] = useState([]);
  const [isFormReady, setIsFormReady] = useState(false);
  
  const { data: getCategory } = useFetch("/api/category?deleteType=SD&&size=10000");
  const { data: getProduct, loading: getProductLoading } = useFetch(`/api/product/get/${id}`);
  
  const editorRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  const queryClient = useQueryClient();
  const router = useRouter();

  const formSchema = LoginSchema.pick({
    name: true,
    slug: true,
    category: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    description: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      description: "",
    },
  });

  // Load categories
  useEffect(() => {
    if (getCategory && getCategory.success) {
      const data = getCategory.data;
      const options = data.map((cat) => ({
        label: cat.name,
        value: cat._id,
      }));
      setCategoryOption(options);
    }
  }, [getCategory]);

  // Populate form when product data loads
  useEffect(() => {
    if (getProduct && getProduct.success && getProduct.data) {
      const product = getProduct.data;
      
      form.reset({
        name: product.name || "",
        slug: product.slug || "",
        category: product.category?._id || product.category || "",
        mrp: product.mrp || 0,
        sellingPrice: product.sellingPrice || 0,
        discountPercentage: product.discountPercentage || 0,
        description: product.description || "",
      });

      if (product.media && product.media.length > 0) {
        const mediaArray = product.media.map(m => ({
          _id: m._id,
          url: m.secure_url
        }));
        setSelectedMedia(mediaArray);
      }

      setIsFormReady(true);
    }
  }, [getProduct]);

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === "name" && value.name) {
        form.setValue("slug", slugify(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  const editor = (event, editor) => {
    const data = editor.getData();
    form.setValue('description', data);
  };

  const handleMediaSelect = () => {
    setOpen(false);
  };

 const onSubmit = async (values) => {
  try {
    setLoading(true);

    if (selectedMedia.length <= 0) {
      showToast('error', 'Please select at least one media.');
      setLoading(false);
      return;
    }

    const mediaIds = selectedMedia.map(media => media._id);
    
    // ✅ Add _id to the payload
    const payload = {
      ...values,
      _id: id,  // Add the product ID from URL params
      media: mediaIds
    };

    console.log('Submitting payload:', payload);

    // ✅ CHANGED: Remove /${id} from URL, send _id in body instead
    const { data: response } = await axios.put(
      '/api/product/update',  // Changed from `/api/product/update/${id}`
      payload
    );

    if (!response.success) {
      throw new Error(response.message);
    }

    queryClient.invalidateQueries({ queryKey: ["product-data"] });

    showToast("success", response.message);

    setTimeout(() => {
      router.push(ADMIN_PRODUCT_SHOW);
    }, 1000);
  } catch (error) {
    showToast("error", error?.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
};


  if (getProductLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (!getProduct || !getProduct.success) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-red-500">Product not found</div>
      </div>
    );
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">Edit Product</h4>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6 grid md:grid-cols-2 gap-5">
                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter product name"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Slug <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter slug"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Category <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            options={categoryOption}
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

                <div className="mb-3 md:col-span-2">
                  <FormLabel className="mb-3">
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  {isFormReady && (
                    <Editor 
                      onChange={editor} 
                      initialData={form.getValues('description')}
                      editorRef={editorRef}
                    />
                  )}
                  <FormMessage />
                </div>
              </div>

              <div className="md:col-span-2 border-dashed rounded p-5 text-center mt-5">
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                  onSelect={handleMediaSelect}
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

                <div
                  onClick={() => setOpen(true)}
                  className="bg-gray-50 dark:bg-card border w-[200px] mx-auto p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold">Select Media</span>
                </div>
              </div>

              <div className="pt-4">
                <Buttonloading
                  loading={loading}
                  type="submit"
                  text="Update Product"
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

export default EditProduct;
