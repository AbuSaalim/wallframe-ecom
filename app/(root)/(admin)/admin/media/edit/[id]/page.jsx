'use client';

import React, { useState, useEffect } from 'react';
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

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Media' },
  { href: ADMIN_MEDIA_SHOW, label: 'Media' },
  { href: '', label: 'Edit Media' },
];

const EditMedia = ({ params }) => {
  const { id } = params;

  const { data: mediaData, loading, error } = useFetch(`/api/media/get/${id}`);

  // Log mediaData to debug issues
  useEffect(() => {
    console.log('Fetched mediaData:', mediaData);
  }, [mediaData]);

  const formSchema = LoginSchema.pick({
    _id: true,
    alt: true,
    title: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: mediaData?._id || '',
      alt: mediaData?.alt || '',
      title: mediaData?.title || '',
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const handleOnSubmit = async (values) => {
    try {
      setSubmitting(true);
      // API call to update media (example)
      // await axios.put('/api/media/update', values);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading media data...</p>;
  if (error) return <p className="text-red-500">Error loading media: {error}</p>;

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <Card className="shadow-sm">
        <CardHeader className="px-3 py-3 border-b border-border">
          <h4 className="text-xl font-semibold">Edit Media</h4>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-8">

            {mediaData?.data?.secure_url ? (
  <Image
    src={mediaData.data.secure_url}
    alt={mediaData.data.alt || 'Media image'}
    width={200}
    height={200}
  />
) : (
  <p>No image URL found.</p>
)}


              <div className="mb-5">
                <FormField
                  control={form.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter alt text" {...field} disabled={submitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter title" {...field} disabled={submitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-3">
                <Buttonloading loading={submitting} type="submit" text="Update Media" className="cursor-pointer" />
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMedia;
