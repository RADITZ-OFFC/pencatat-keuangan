import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes (handles logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      // Kalau event SIGNED_OUT atau USER_DELETED → user sudah null, App.jsx redirect ke login
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null)
      }
    })

    // Polling setiap 60 detik — deteksi kalau session di-revoke dari Supabase dashboard
    const interval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        setUser(null)
      } else {
        // Refresh token supaya tidak expired
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (!refreshed.session) setUser(null)
      }
    }, 60 * 1000) // cek tiap 1 menit

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const getDisplayName = () => {
    if (!user) return ''
    return user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split('@')[0]
      || 'User'
  }

  const getAvatar = () => {
    return user?.user_metadata?.avatar_url || null
  }

  return { user, loading, signUp, signIn, signInWithGoogle, signOut, getDisplayName, getAvatar }
}
