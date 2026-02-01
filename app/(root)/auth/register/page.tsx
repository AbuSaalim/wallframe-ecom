"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import Logo from "@/public/assets/images/logo-black.png";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { z } from "zod";
import Link from "next/link";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [isTypePassword, setIsTypePassword] = useState(true);
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase letter")
      .regex(/[a-z]/, "Password must contain lowercase letter")
      .regex(/[0-9]/, "Password must contain number"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegisterSubmit = async (values) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      await updateProfile(userCredential.user, {
        displayName: values.name,
      });

      await axios.post("/api/user/create", {
        uid: userCredential.user.uid,
        name: values.name,
        email: values.email,
      });

      form.reset();
      showToast('success', 'Account created successfully!');
      
      setTimeout(() => {
        router.push(WEBSITE_LOGIN());
      }, 1500);
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      }
      showToast('error', error.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="">
        <CardContent className="">
          <div className="flex justify-center">
            <Image
              src={Logo.src}
              width={Logo.width}
              height={Logo.height}
              alt="logo"
              className="max-w-[150px]"
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p>Create new account by filling out the form below</p>
          </div>

          <div className="mt-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleRegisterSubmit)}
                className="space-y-8"
              >
                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your name"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@gmail.com"
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
                  {loading ? (
                    <Buttonloading loadingText="Creating account..." />
                  ) : (
                    <Button type="submit" className="w-full">
                      Create Account
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <div className="flex justify-center items-center gap-1">
                    <p className="pt-1">Already have account?</p>
                    <Link
                      href={WEBSITE_LOGIN()}
                      className="text-primary underline"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
