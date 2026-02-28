import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import api from "../services/api"

type Role = "super_admin" | "owner" | "resident" | "admin"

type User = {
    id: string
    name: string
    email: string
    role: Role
    propertyId?: string | null
}

type AuthContextType = {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<User>
    registerOwner: (payload: { name: string; email: string; password: string; propertyName: string; propertyType: "pg" | "hotel"; propertyAddress: string }) => Promise<User>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("user")
        if (stored) setUser(JSON.parse(stored))
        setLoading(false)
    }, [])

    const persist = (token: string, nextUser: User) => {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(nextUser))
        setUser(nextUser)
    }

    const login = async (email: string, password: string) => {
        const { data } = await api.post("/v2/auth/login", { email, password })
        persist(data.token, data.user)
        return data.user
    }

    const registerOwner = async (payload: { name: string; email: string; password: string; propertyName: string; propertyType: "pg" | "hotel"; propertyAddress: string }) => {
        const { data } = await api.post("/v2/auth/register-owner", payload)
        persist(data.token, data.user)
        return data.user
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    return <AuthContext.Provider value={{ user, loading, login, registerOwner, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}
