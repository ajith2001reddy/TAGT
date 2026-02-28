import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function RegisterPage() {
  const { registerOwner } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "", propertyName: "", propertyType: "pg" as "pg" | "hotel", propertyAddress: "" })
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await registerOwner(form)
      nav("/owner-dashboard")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-2xl border border-white/10 rounded-2xl p-6 bg-white/[0.03] grid md:grid-cols-2 gap-3">
        <h1 className="text-2xl font-bold md:col-span-2">Owner Registration</h1>
        {error && <p className="text-rose-300 text-sm md:col-span-2">{error}</p>}
        <input className="bg-white/5 p-3 rounded-lg" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="bg-white/5 p-3 rounded-lg" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="bg-white/5 p-3 rounded-lg" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <input className="bg-white/5 p-3 rounded-lg" placeholder="Property Name" value={form.propertyName} onChange={(e) => setForm({ ...form, propertyName: e.target.value })} required />
        <select className="bg-white/5 p-3 rounded-lg" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value as "pg" | "hotel" })}><option value="pg">PG</option><option value="hotel">Hotel</option></select>
        <input className="bg-white/5 p-3 rounded-lg" placeholder="Property Address" value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} required />
        <button className="md:col-span-2 py-3 rounded-lg bg-violet-500">Create Owner Account</button>
      </form>
    </div>
  )
}
