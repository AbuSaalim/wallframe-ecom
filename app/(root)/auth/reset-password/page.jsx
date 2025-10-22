'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import Logo from '@/public/assets/images/logo-black.png'
import Image from 'next/image'
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/lib/zodSchema"
import { useForm } from "react-hook-form"

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

import Link from 'next/link'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import OTPVerification from '@/components/Application/OTPVerification'
import UpdatePassword from '@/components/Application/UpdatePassword'

const ResetPassword = () => {
    const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
    const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const formSchema = LoginSchema.pick({
        email: true
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    });

    const handleEmailVerification = async (values) => {
        try {
            setEmailVerificationLoading(true);
            const { data: sendOtpResponse } = await axios.post('/api/auth/reset-password/send-otp', values);

            if (!sendOtpResponse.success) {
                throw new Error(sendOtpResponse.message);
            }

            setOtpEmail(values.email); // Correctly set the email
            showToast('success', sendOtpResponse.message);

        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Verification failed';
            showToast('error', message);
        } finally {
            setEmailVerificationLoading(false); // Correctly set the loading state
        }
    };

    const handleOtpVerification = async (values) => {
        try {
            setOtpVerificationLoading(true);
            const { data: verifyResponse } = await axios.post('/api/auth/reset-password/verify-otp', values);

            if (!verifyResponse.success) {
                throw new Error(verifyResponse.message);
            }

            showToast('success', verifyResponse.message);
            setIsOtpVerified(true);

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
                                <h1 className="text-3xl font-bold">Reset Password</h1>
                                <p>Enter your email for password reset</p>
                            </div>

                            <div className='mt-5'>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleEmailVerification)} className="space-y-8">
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

                                        <div className='mb-3'>
                                            <Buttonloading
                                                loading={emailVerificationLoading}
                                                type="submit" // Changed from "send Otp" to "submit"
                                                text="Send OTP" // Changed text for clarity
                                                className="w-full cursor-pointer"
                                            />
                                        </div>

                                        <div className="text-center">
                                            <div className='flex justify-center items-center gap-1'>
                                                <Link href={WEBSITE_LOGIN} className='text-primary underline'>
                                                    Back to login
                                                </Link>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </>
                    ) : (
                        <>
                            {!isOtpVerified ? (
                                <OTPVerification
                                    email={otpEmail}
                                    onSubmit={handleOtpVerification}
                                    loading={otpVerificationLoading}
                                />
                            ) : (
                                <UpdatePassword email={otpEmail} />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ResetPassword;

