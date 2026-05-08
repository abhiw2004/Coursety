import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getToken, setToken, me, type PublicUser, type Role } from '../api'

type AuthContextType = {
  token: string | null
  user: PublicUser | null
  loading: boolean
  isLearner: boolean
  isInstructor: boolean
  isAdmin: boolean
  signIn: (token: string, user: PublicUser) => void
  signOut: () => void
  refresh: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(token))

  const refresh = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { user } = await me()
      setUser(user)
    } catch {
      setToken(null)
      setTokenState(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signIn = useCallback((t: string, u: PublicUser) => {
    setToken(t)
    setTokenState(t)
    setUser(u)
    setLoading(false)
  }, [])

  const signOut = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
    [user]
  )

  const value: AuthContextType = {
    token,
    user,
    loading,
    isLearner: user?.role === 'learner',
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    signIn,
    signOut,
    refresh,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
