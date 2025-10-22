"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { Button } from "@/components/ui/button";
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
import { z } from "zod";  // Fixed import

import axios from "axios";
import { showToast } from "@/lib/showToast";  
import { useRouter } from "next/navigation";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";

const UpdatePassword = ({email}) => {
    const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [isTypePassword, setIsTypePassword] = useState(true);

  const formSchema = LoginSchema.pick({
   email:true,
    password: true,
  }).extend({
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Password And Confirmed Password must be Same',
    path: ['confirmPassword'],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
        email: email,
      password: "",
      confirmPassword: "",
    },
  });

  const handlePasswordUpdate = async (values) => {
    console.log(values);
    try {
      setLoading(true);
      const { data: passwordUpdate } = await axios.put('/api/auth/reset-password/update-password', values);

      if (!passwordUpdate.success) {
        throw new Error(passwordUpdate.message);
      }

      form.reset();

      // Fixed: Use string 'success' and proper syntax
      showToast('success', passwordUpdate.message);
       router.push(WEBSITE_LOGIN)
    } catch (error) {
      // Fixed: Use string 'error', proper variable, and close parenthesis
      showToast('error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
     
        <div>
          

          <div className="text-center">
            <h1 className="text-3xl font-bold"> Update Passsword</h1>
            <p>Create new password by filling below form.</p>
          </div>

          <div className="mt-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePasswordUpdate)}
                className="space-y-8"
              >
                {/* Rest of your form fields remain the same */}
              

                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type={isTypePassword ? "password" : "text"}
                            placeholder="*************"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type={isTypePassword ? "password" : "text"}
                            placeholder="*************"
                            {...field}
                          />
                        </FormControl>
                        <button
                          className="absolute top-1/2 right-2 cursor-pointer"
                          type="button"
                          onClick={() => setIsTypePassword(!isTypePassword)}
                        >
                          {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-3">
                  <Buttonloading
                    loading={loading}
                    type="submit"
                    text="Update Password"
                    className="w-full cursor-pointer"
                  />
                </div>

              
              </form>
            </Form>
          </div>
        </div>

    </div>
  );
};

export default UpdatePassword;
