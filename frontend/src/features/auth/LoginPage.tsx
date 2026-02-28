import { useState } from "react"
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth"
import { auth } from "../../lib/firebase"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

const googleProvider = new GoogleAuthProvider()

// Exchange Firebase ID token for our backend JWT
async function exchangeToken(firebaseUser: any) {
    const firebaseToken = await firebaseUser.getIdToken(true)
    const res = await api.post("/auth/firebase", { firebaseToken })
    return res.data // { token, user }
}

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSuccess = (data: { token: string; user: { role: string } }) => {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.user.role === "super_admin" || data.user.role === "owner") {
            navigate("/dashboard")
        } else {
            navigate("/resident")
        }
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password)
            const data = await exchangeToken(credential.user)
            handleSuccess(data)
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
                setError("Invalid email or password")
            } else if (err.code === "auth/user-not-found") {
                setError("No account found with this email")
            } else {
                setError("Login failed. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError("")
        setLoading(true)
        try {
            const credential = await signInWithPopup(auth, googleProvider)
            const data = await exchangeToken(credential.user)
            handleSuccess(data)
        } catch (err: any) {
            if (err.code === "auth/popup-closed-by-user") {
                setError("")
            } else if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Google sign-in failed. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(56,189,248,0.12),transparent_40%)]" />
            <div className="absolute inset-0 backdrop-blur-[2px]" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:gap-12">
                <div className="hidden lg:block flex-1">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Trusted by modern property operations teams
                    </p>
                    <h1 className="mt-6 max-w-xl text-5xl font-black tracking-tight leading-tight">
                        Premium property management.
                        <span className="bg-gradient-to-r from-violet-300 via-indigo-300 to-cyan-200 bg-clip-text text-transparent"> Enterprise-grade experience.</span>
                    </h1>
                    <p className="mt-5 max-w-lg text-base text-white/60">
                        Manage residents, payments, and maintenance in one advanced dashboard designed for speed, clarity, and scale.
                    </p>
                </div>

                <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl md:p-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Welcome to TAGT</h2>
                        <p className="mt-1 text-sm text-white/65">Sign in to continue to your workspace</p>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/15" />
                            <span className="text-xs text-white/40">or</span>
                            <div className="h-px flex-1 bg-white/15" />
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-xl border border-white/15 bg-[#0d1020]/80 p-3 text-sm text-white placeholder:text-white/30 focus:border-violet-400/70 focus:outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full rounded-xl border border-white/15 bg-[#0d1020]/80 p-3 text-sm text-white placeholder:text-white/30 focus:border-violet-400/70 focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 p-3 font-semibold transition hover:brightness-110 disabled:opacity-50"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
