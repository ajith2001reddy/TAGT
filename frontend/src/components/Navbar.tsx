import { useAuth } from "../context/AuthContext"

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth()

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition"
                >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="2" y1="5" x2="16" y2="5" /><line x1="2" y1="9" x2="16" y2="9" /><line x1="2" y1="13" x2="16" y2="13" />
                    </svg>
                </button>
                <p className="text-white/50 text-sm font-medium">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 capitalize">
                    <span className={`w-1.5 h-1.5 rounded-full ${user?.role === "admin" ? "bg-violet-400" : "bg-emerald-400"}`} />
                    {user?.role}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
            </div>
        </header>
    )
}