import { useAuth } from "../context/AuthContext"

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth()

    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070910]/80 px-5 py-3.5 backdrop-blur-xl lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white/80 lg:hidden"
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="2" y1="5" x2="16" y2="5" /><line x1="2" y1="9" x2="16" y2="9" /><line x1="2" y1="13" x2="16" y2="13" />
                        </svg>
                    </button>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/30">TAGT Workspace</p>
                        <p className="text-sm font-medium text-white/60">
                            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs capitalize text-white/60 sm:inline-flex">
                        {user?.role}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-violet-500/40 to-indigo-600/40 text-xs font-bold text-white/80">
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                </div>
            </div>
        </header>
    )
}
