'use client'

import axios from 'axios'
import React, { use, useEffect, useState } from 'react'
import Image from 'next/image'  // ✅ Add this
import Link from 'next/link'    // ✅ Add this instead of lucide-react
import verifiedImg from '@/public/assets/images/verified.gif'
import verificationFieldImg from '@/public/assets/images/verification-failed.gif'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'

interface EmailVerificationProps {
  params: Promise<{
    token: string
  }>
}

const EmailVerification = ({ params }: EmailVerificationProps) => {
  const { token } = use(params)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      try {
        console.log('Token being sent:', token)
        console.log('Token length:', token?.length)
        
        const { data: verificationResponse } = await axios.post('/api/auth/verify-email', { token })
        
        console.log('Server response:', verificationResponse)
        
        if (verificationResponse.success) {
          setIsVerified(true)
        } else {
          setError(verificationResponse.message || 'Verification failed')
        }
      } catch (err: any) {
        console.error('Full error:', err)
        console.error('Error response:', err.response?.data)
        console.error('Error status:', err.response?.status)
        
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error ||
                           err.message || 
                           'An error occurred during verification'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    
    if (token) {
      verify()
    } else {
      setError('No token provided')
      setLoading(false)
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">⏳ Verifying your email...</h1>
          <p className="text-gray-600">Please wait while we verify your account.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div>
              <div className="flex justify-center items-center">
                <Image 
                  src={verificationFieldImg} 
                  alt="Verification Failed"
                  width={200}
                  height={200}
                />
              </div>
              <div className='text-center'>
                <h1 className='text-2xl font-bold text-red-500 my-5'>Email Verification Failed!</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button asChild>
                  <Link href="/auth/register">
                    Register Again
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardContent className="pt-6">
          {isVerified ? (
            <div>
              <div className="flex justify-center items-center">
                <Image 
                  src={verifiedImg} 
                  alt="Email Verified"
                  width={100}
                  height={100}
                />
              </div>
              <div className='text-center'>
                <h1 className='text-2xl font-bold text-green-500 my-5'>Email Verification Success!</h1>
                <Button asChild>
                  <Link href={WEBSITE_HOME}>
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-center items-center">
                <Image 
                  src={verificationFieldImg} 
                  alt="Verification Failed"
                  width={100}
                  height={100}
                  
                />
              </div>
              <div className='text-center'>
                <h1 className='text-2xl font-bold text-red-500 my-5'>Email Verification Failed!</h1>
                <Button asChild>
                  <Link href={WEBSITE_HOME}>
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerification
