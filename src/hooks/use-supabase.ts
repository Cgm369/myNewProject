import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

type SafeAuthState = {
  getToken: ReturnType<typeof useAuth>['getToken']
  isLoaded: boolean
  isSignedIn: boolean
  userId: string | null | undefined
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function useSafeAuth() {
  try {
    const auth = useAuth()
    return {
      getToken: auth.getToken,
      isLoaded: auth.isLoaded,
      isSignedIn: Boolean(auth.isSignedIn),
      userId: auth.userId,
    } satisfies SafeAuthState
  } catch {
    return {
      getToken: async () => null,
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    } satisfies SafeAuthState
  }
}

export function useSupabase() {
  const { getToken, isLoaded, isSignedIn, userId } = useSafeAuth()
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const canUseClient = isSupabaseConfigured && isLoaded && isSignedIn && Boolean(userId)

  useEffect(() => {
    if (!canUseClient || !userId) {
      return
    }

    let cancelled = false

    const initClient = async () => {
      const token = await getToken({ template: 'supabase' })
      if (cancelled || !token) {
        setClient(null)
        return
      }

      const authClient = createClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
      setClient(authClient)
    }

    initClient()

    return () => {
      cancelled = true
    }
  }, [canUseClient, getToken, userId])

  return { client: canUseClient ? client : null, isLoaded, isSignedIn, userId, isSupabaseConfigured }
}
