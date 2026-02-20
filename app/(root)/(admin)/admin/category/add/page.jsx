'use client'

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';  // ✅ Add this import
import { useRouter } from 'next/navigation';  // ✅ Add this import
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

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Add Category' }
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

const AddCategory = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();  // ✅ Add this
  const router = useRouter();  // ✅ Add this

  const formSchema = LoginSchema.pick({
    name: true,
    slug: true
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

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

      const { data: response } = await apiClient.post('/api/category/create', values)

      if (!response.success) {
        throw new Error(response.message)
      }

      // ✅ Invalidate the category query cache
      queryClient.invalidateQueries({ queryKey: ['category-data'] });

      form.reset();
      showToast('success', response.message);

      // ✅ Optional: Redirect to category list page
      setTimeout(() => {
        router.push(ADMIN_CATEGORY_SHOW);
      }, 1000);

    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">Add Category</h4>
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
                  text="Add Category"
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

export default AddCategory
