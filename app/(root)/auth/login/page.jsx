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
import { WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from '@/routes/WebsiteRoute'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import OTPVerification from '@/components/Application/OTPVerification'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'

const LoginPage = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false)
  const [isTypePassword, setIsTypePassword] = useState(true)
  const [otpEmail, setOtpEmail] = useState('')  // Fixed: typo and default value

  const formSchema = LoginSchema.pick({
    email: true
  }).extend({
    password: z.string().min(3, 'Password must be at least 3 characters')
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
      const {data: loginResponse} = await axios.post('/api/auth/login', values)
      
      if (!loginResponse.success) {
        throw new Error(loginResponse.message)
      }
      
      setOtpEmail(values.email)
      form.reset()
      showToast('success', loginResponse.message)
      
    } catch (error) {
      // Fixed: Properly extract axios error message
      const message = error.response?.data?.message || error.message || 'Login failed'
      showToast('error', message)
    } finally {
      setLoading(false)
    }
  }

  
const handleOtpVerification = async (values) => {
  try {
    setOtpVerificationLoading(true);
    // The API response is stored in 'verifyResponse'
    const { data: verifyResponse } = await axios.post('/api/auth/verify-otp', values);
    
    if (!verifyResponse.success) {
      // Throw an error to be caught by the catch block
      throw new Error(verifyResponse.message);
    }
    
    // Show success toast
    showToast('success', verifyResponse.message);
    
    // Reset state
    setOtpEmail('');
    
    // ✅ CORRECTED: Dispatch the login action with the correct data
    // The user object is inside verifyResponse.data
    dispatch(login(verifyResponse.data));
    
    // You can now redirect the user
    // router.push('/dashboard');

  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Verification failed';
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
                              <Input type="email" placeholder="example@gmail.com" {...field} />
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
                              <Input type={isTypePassword ? 'password' : 'text'} placeholder="*************" {...field} />
                            </FormControl>
                            <button 
                              className='absolute top-1/2 right-2 cursor-pointer' 
                              type='button' 
                              onClick={() => setIsTypePassword(!isTypePassword)}
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
                        <p className='pt-1'>Don't have Account?</p>
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

export default LoginPage
