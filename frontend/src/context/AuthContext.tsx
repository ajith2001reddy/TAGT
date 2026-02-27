import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { signOut } from "firebase/auth"
import { auth } from "../lib/firebase"

type User = {
    id: string
    name: string
    email: string
    role: "admin" | "resident"
    roomId?: string | null
}

type AuthContextType = {
    user: User | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeToken(token: string): User | null {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(atob(base64))
        if (payload.exp && Date.now() >= payload.exp * 1000) return null
        return payload
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            const decoded = decodeToken(token)
            if (decoded) {
                const stored = localStorage.getItem("user")
                setUser(stored ? JSON.parse(stored) : decoded)
            } else {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
            }
        }
        setLoading(false)
    }, [])

    const logout = async () => {
        await signOut(auth).catch(() => { })
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        window.location.href = "/login"
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}