'use client'

import { use, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Buttonloading from '@/components/Application/Buttonloading';
import { LoginSchema } from '@/lib/zodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { showToast } from '@/lib/showToast';
import apiClient from '@/lib/apiClient';
import useFetch from '@/hooks/useFetch';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Edit Category' }
]

// Slugify function
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const EditCategory = ({ params }) => {
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // ✅ FIXED: Use useFetch with GET endpoint, not axios.put
  const { data: categoryData, loading: fetchingCategory } = useFetch(`/api/category/get/${id}`);

  const formSchema = LoginSchema.pick({
    _id: true,
    name: true,
    slug: true
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: '',  // ✅ Don't hardcode id here, load from API
      name: '',
      slug: '',
    },
  });

  // Load existing data into form
  useEffect(() => {
    if (categoryData && categoryData.success) {
      const data = categoryData.data;
      form.reset({
        _id: data._id || '',
        name: data.name || '',
        slug: data.slug || '',
      });
    }
  }, [categoryData, form]);

  // Watch the name field and auto-generate slug
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === 'name' && value.name) {
        form.setValue('slug', slugify(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      // ✅ FIXED: Removed extra }
      const { data: response } = await apiClient.put('/api/category/update', values);

      if (!response.success) {
        throw new Error(response.message);
      }

      // Invalidate the category query cache
      queryClient.invalidateQueries({ queryKey: ['category-data'] });

      showToast('success', response.message);

      // Redirect to category list page
      setTimeout(() => {
        router.push(ADMIN_CATEGORY_SHOW);
      }, 1000);

    } catch (error) {
      console.error('Update error:', error);
      showToast('error', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while fetching
  if (fetchingCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading category data...</p>
      </div>
    );
  }

  // Show error if category not found
  if (!categoryData || !categoryData.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Category not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">Edit Category</h4>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter Category name"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
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

              <div className="pt-4">
                <Buttonloading
                  loading={loading}
                  type="submit"
                  text="Update Category"
                  className="cursor-pointer"
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditCategory
