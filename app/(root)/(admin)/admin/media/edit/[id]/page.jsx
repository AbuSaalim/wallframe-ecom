'use client';

import React, { useState, useEffect, use } from 'react';
import useFetch from '@/hooks/useFetch';
import { ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW } from '@/routes/AdminPanelRoute';
import BreadCrumb from '@/components/Application/Admin/BreadCrumb';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Buttonloading from '@/components/Application/Buttonloading';
import { LoginSchema } from '@/lib/zodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import axios from 'axios';
import { showToast } from '@/lib/showToast';

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Dashboard' },
  { href: ADMIN_MEDIA_SHOW, label: 'Media' },
  { href: '', label: 'Edit Media' },
];

const EditMedia = ({ params }) => {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const { data: mediaData, loading: fetchingMedia } = useFetch(`/api/media/get/${id}`);
  const [loading, setLoading] = useState(false);

  const formSchema = LoginSchema.pick({
    _id: true,
    alt: true,
    title: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: '',
      alt: '',
      title: '',
    },
  });

  useEffect(() => {
    if (mediaData && mediaData.success) {
      const data = mediaData.data;
      form.reset({
        _id: data._id || '',
        alt: data.alt || '',
        title: data.title || '',
      });
    }
  }, [mediaData, form]);

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const { data: response } = await axios.put('/api/media/update', values);

      if (!response.success) {
        throw new Error(response.message);
      }

      showToast('success', response.message);
    } catch (error) {
      showToast('error', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMedia) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading media data...</p>
      </div>
    );
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">Edit Media</h4>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {mediaData?.data?.secure_url ? (
                <div className="mb-5">
                  <Image
                    src={mediaData.data.secure_url}
                    alt={mediaData.data.alt || 'Media image'}
                    width={200}
                    height={200}
                    style={{ width: '200px', height: 'auto' }}
                    priority
                    className="rounded-md"
                  />
                </div>
              ) : (
                <p className="text-gray-500">No image URL found.</p>
              )}

              <FormField
                control={form.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter alt text"
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter title"
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
                  text="Update Media"
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

export default EditMedia;
