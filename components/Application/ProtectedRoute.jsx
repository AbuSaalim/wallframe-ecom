'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthChange } from '@/lib/authService'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import Image from 'next/image'
import Logo from '@/public/assets/images/logo.png'

/**
 * ProtectedRoute component - Protects routes that require authentication
 * @param {ReactNode} children - Component to protect
 * @param {string} requiredRole - Required role (optional, default is 'user')
 */
export function ProtectedRoute({ children, requiredRole = 'user' }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        // User not authenticated, redirect to login
        router.push(WEBSITE_LOGIN)
        return
      }

      // User is authenticated
      setIsAuthorized(true)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Image
            src={Logo.src}
            width={150}
            height={150}
            alt='logo'
            className='mx-auto mb-4'
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return children
}

export default ProtectedRoute
