import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === "super_admin") nav("/provider-dashboard")
      else if (user.role === "owner") nav("/owner-dashboard")
      else nav("/resident-dashboard")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md border border-white/10 rounded-2xl p-6 bg-white/[0.03] space-y-3">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="text-rose-300 text-sm">{error}</p>}
        <input className="w-full bg-white/5 p-3 rounded-lg" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full bg-white/5 p-3 rounded-lg" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full py-3 rounded-lg bg-violet-500 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  )
}
