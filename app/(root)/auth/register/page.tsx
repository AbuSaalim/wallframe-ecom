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
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [isTypePassword, setIsTypePassword] = useState(true);
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create user in MongoDB
      await axios.post("/api/user/create", {
        uid: userCredential.user.uid,
        name: userCredential.user.displayName || "User",
        email: userCredential.user.email,
        role: "user",
      });

      showToast('success', 'Account created successfully!');
      
      setTimeout(() => {
        router.push(WEBSITE_LOGIN());
      }, 1500);
    } catch (error) {
      console.error("Google sign-up error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        return;
      }
      showToast("error", "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

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
        role: "user",
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

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    variant="outline"
                    className="w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </Button>
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
