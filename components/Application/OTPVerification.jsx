import { LoginSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Buttonloading from './Buttonloading'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { showToast } from '@/lib/showToast'
import axios from 'axios'

const OTPVerification = ({ email, onSubmit, loading }) => {
  const [isResendingOtp, setIsResendingOtp] = useState(false)  // Fixed: typo

  const formSchema = LoginSchema.pick({
    otp: true,
    email: true
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      email: email
    }
  })

  const handleOtpVerification = async (values) => {
    await onSubmit(values)
  }

  const resendOTP = async () => {
    try {
      setIsResendingOtp(true)
      const { data: resendResponse } = await axios.post('/api/auth/resend-otp', { email })  // Fixed: wrap in object
      
      if (!resendResponse.success) {
        throw new Error(resendResponse.message)
      }
   
      showToast('success', resendResponse.message)
      
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to resend OTP'
      showToast('error', message)
    } finally {
      setIsResendingOtp(false)
    }
  }  // Fixed: removed extra brace

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOtpVerification)} className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Please complete verification</h1>
            <p className='text-md'>We have sent a One-Time Password (OTP) to your registered email address. The OTP is valid for 10 minutes only.</p>
          </div>
          
          <div className='my-5 flex justify-center'>
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">One-Time Password (OTP)</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot className="text-xl size-10" index={0} />
                        <InputOTPSlot className="text-xl size-10" index={1} />
                        <InputOTPSlot className="text-xl size-10" index={2} />
                        <InputOTPSlot className="text-xl size-10" index={3} />
                        <InputOTPSlot className="text-xl size-10" index={4} />
                        <InputOTPSlot className="text-xl size-10" index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='mb-3'>
            <Buttonloading 
              loading={loading} 
              type="submit" 
              text="Verify" 
              className="w-full cursor-pointer" 
            />

            <div className='text-center mt-5'>
              {!isResendingOtp ? (  // Fixed: inverted logic
                <button 
                  onClick={resendOTP} 
                  type='button' 
                  disabled={isResendingOtp}
                  className='text-blue-500 cursor-pointer hover:underline disabled:opacity-50'
                >
                  Resend OTP
                </button>
              ) : (
                <span className='text-md'>Resending....</span>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default OTPVerification
