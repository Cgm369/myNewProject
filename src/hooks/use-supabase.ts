import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function useSupabase() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [client, setClient] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setClient(null)
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
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!,
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
  }, [isLoaded, isSignedIn, getToken])

  return { client, isLoaded, isSignedIn }
}
