'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_failed')
          return
        }

        if (data.session) {
          // Successfully authenticated
          router.push('/')
        } else {
          // No session found
          router.push('/?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  )
} 