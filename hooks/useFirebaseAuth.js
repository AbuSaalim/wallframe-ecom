// Custom hook for Firebase authentication
import { useEffect, useState } from 'react'
import { onAuthChange, logout as firebaseLogout } from '@/lib/authService'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { login, logout } from '@/store/reducer/authReducer'

/**
 * useFirebaseAuth hook
 * Manages Firebase authentication state and syncs with Redux
 * @returns {Object} { user, loading, logout }
 */
export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      if (authUser) {
        // User is logged in
        const userData = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          emailVerified: authUser.emailVerified,
          role: 'user'
        }
        setUser(userData)
        dispatch(login(userData))
      } else {
        // User is logged out
        setUser(null)
        dispatch(logout())
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [dispatch])

  const handleLogout = async () => {
    try {
      setLoading(true)
      await firebaseLogout()
      setUser(null)
      dispatch(logout())
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout: handleLogout
  }
}

export default useFirebaseAuth
