import { createContext, useContext, useState, useEffect } from 'react'
import { loginApi, signupApi, getMeApi } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // On mount, verify token is still valid
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await getMeApi()
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      } catch {
        // Token invalid — clear everything
        logout()
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const res = await loginApi({ email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return res.data
  }

  const signup = async (name, email, password) => {
    const res = await signupApi({ name, email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
