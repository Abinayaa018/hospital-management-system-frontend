"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { API_BASE_URL } from "@/lib/api"

interface User {
  name: string
  email: string
  role: string
  avatar?: string
}

type LoginResult = "success" | "invalid_password" | "not_found" | "error"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.status === 404) return "not_found"
      if (res.status === 401) return "invalid_password"
      if (!res.ok) return "error"
      const data = await res.json()
      setUser({
        name: data.name || "User",
        email: data.email,
        role: data.role || "User",
        avatar: data.avatar,
      })
      return "success"
    } catch {
      return "error"
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
