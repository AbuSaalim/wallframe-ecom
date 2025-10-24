'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import Logo from '@/public/assets/images/logo-black.png'
import Image from 'next/image'
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/lib/zodSchema"
import { useForm } from "react-hook-form"
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Buttonloading from '@/components/Application/Buttonloading'
import { z } from 'zod'
import Link from 'next/link'
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from '@/routes/WebsiteRoute'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import OTPVerification from '@/components/Application/OTPVerification'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'
import { useRouter, useSearchParams } from 'next/navigation'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'

// User roles constants for better maintainability
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}

const LoginPage = () => {
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false)
  const [isTypePassword, setIsTypePassword] = useState(true)
  const [otpEmail, setOtpEmail] = useState('')

  // Improved form schema - more secure and cleaner
  const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, 'Password must be at least 6 characters long.')
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLoginSubmit = async (values) => {
    try {
      setLoading(true)
      const { data: loginResponse } = await axios.post('/api/auth/login', values)

      if (!loginResponse.success) {
        throw new Error(loginResponse.message)
      }

      setOtpEmail(values.email)
      form.reset()
      showToast('success', loginResponse.message)

    } catch (error) {
      // Show generic error message for security, log detailed error for debugging
      console.error('Login error:', error)
      const message = error.response?.data?.message || 'Invalid credentials. Please try again.'
      showToast('error', message)
    } finally {
      setLoading(false)
    }
  }

  // const handleOtpVerification = async (values) => {
  //   try {
  //     setOtpVerificationLoading(true);
  //     const { data: verifyResponse } = await axios.post('/api/auth/verify-otp', values);

  //     if (!verifyResponse.success) {
  //       throw new Error(verifyResponse.message);
  //     }

  //     showToast('success', verifyResponse.message);
  //     setOtpEmail('');

  //     // Extract user object from response - try common locations
  //     const user = verifyResponse.user || verifyResponse.data?.user || verifyResponse.data;

  //     if (!user || typeof user !== 'object') {
  //       console.error("User data missing in API response:", verifyResponse);
  //       showToast('error', 'Authentication failed. Please try again.');
  //       return; 
  //     }
      
  //     // Debug logging (remove in production)
  //     console.log("User authenticated:", { role: user.role, email: user.email });
      
  //     dispatch(login(user));

  //     // **FIXED REDIRECTION LOGIC**
  //     const callbackUrl = searchParams.get('callback');
  //     const userRole = user.role;
  //     const isAdmin = typeof userRole === 'string' && 
  //                    userRole.trim().toLowerCase() === USER_ROLES.ADMIN;

  //     // Priority 1: Admin users always go to admin dashboard
  //     if (isAdmin) {
  //       console.log("Admin user detected. Redirecting to admin dashboard.");
  //       router.push(ADMIN_DASHBOARD);
  //     } 
  //     // Priority 2: If there's a callback URL and user is not admin
  //     else if (callbackUrl && !callbackUrl.includes('admin')) {
  //       console.log(`Non-admin user with callback. Redirecting to: ${callbackUrl}`);
  //       router.push(callbackUrl);
  //     } 
  //     // Priority 3: Default to user dashboard
  //     else {
  //       console.log("Regular user. Redirecting to user dashboard.");
  //       router.push(USER_DASHBOARD);
  //     }

  //   } catch (error) {
  //     console.error('OTP verification error:', error);
  //     const message = error.response?.data?.message || 'Verification failed. Please try again.';
  //     showToast('error', message);
  //   } finally {
  //     setOtpVerificationLoading(false);
  //   }
  // };


  const handleOtpVerification = async (values) => {
    try {
      setOtpVerificationLoading(true);
      const { data: verifyResponse } = await axios.post('/api/auth/verify-otp', values);

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message);
      }

      showToast('success', verifyResponse.message);
      setOtpEmail('');

      const user = verifyResponse.user || verifyResponse.data?.user || verifyResponse.data;

      if (!user || typeof user !== 'object') {
        console.error("CRITICAL: User object not found in API response.", verifyResponse);
        showToast('error', 'Authentication failed. Please try again.');
        return; 
      }
      
      dispatch(login(user));

      // --- AGGRESSIVE DEBUGGING ---
      const userRole = user.role;
      const callbackUrl = searchParams.get('callback');

      console.log("--- REDIRECT DEBUGGING ---");
      console.log("User Role from API:", userRole, "(Type: " + typeof userRole + ")");
      console.log("Callback URL from params:", callbackUrl);
      
      const isAdmin = typeof userRole === 'string' && userRole.trim().toLowerCase() === 'admin';
      console.log("Is Admin?", isAdmin);
      console.log("--- END DEBUGGING ---");


      // **REVISED REDIRECTION LOGIC**
      if (isAdmin) {
        console.log("ATTEMPTING REDIRECT: Admin user detected. Forcing navigation to /admin/dashboard.");
        // Using window.location.href as a more forceful redirect
        window.location.href = ADMIN_DASHBOARD;
      } else if (callbackUrl) {
        console.log(`ATTEMPTING REDIRECT: Non-admin user. Navigating to callback URL: ${callbackUrl}`);
        router.push(callbackUrl);
      } else {
        console.log("ATTEMPTING REDIRECT: Non-admin user, no callback. Navigating to /my-account.");
        router.push(USER_DASHBOARD);
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      const message = error.response?.data?.message || 'Verification failed. Please try again.';
      showToast('error', message);
    } finally {
      setOtpVerificationLoading(false);
    }
  };


  return (
    <div>
      <Card className="w-[400px]">
        <CardContent>
          <div className='flex justify-center'>
            <Image
              src={Logo.src}
              width={Logo.width}
              height={Logo.height}
              alt='logo'
              className='max-w-[150px]'
            />
          </div>

          {!otpEmail ? (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Login Into Account</h1>
                <p>Login into your account by filling out the form below.</p>
              </div>

              <div className='mt-5'>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-8">
                    <div className='mb-5'>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="example@gmail.com" 
                                {...field} 
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='mb-5'>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type={isTypePassword ? 'password' : 'text'} 
                                placeholder="*************" 
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <button
                              className='absolute top-1/2 right-2 cursor-pointer'
                              type='button'
                              onClick={() => setIsTypePassword(!isTypePassword)}
                              disabled={loading}
                            >
                              {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='mb-3'>
                      <Buttonloading
                        loading={loading}
                        type="submit"
                        text="Login"
                        className="w-full cursor-pointer"
                      />
                    </div>

                    <div className="text-center">
                      <div className='flex justify-center items-center gap-1'>
                        <p className='pt-1'>Don&apos;t have Account?</p>
                        <Link href={WEBSITE_REGISTER} className='text-primary underline'>
                          Create account!
                        </Link>
                      </div>
                      <div className="mt-2">
                        <Link href={WEBSITE_RESETPASSWORD} className='text-primary underline'>
                          Forget Password?
                        </Link>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          ) : (
            <OTPVerification
              email={otpEmail}
              onSubmit={handleOtpVerification}
              loading={otpVerificationLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage;
