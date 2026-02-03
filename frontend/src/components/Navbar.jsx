import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
    const { user } = useAuth();
    const role = user?.role;

    return (
        <motion.nav
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="
                sticky top-0 z-30
                bg-black/50 backdrop-blur-2xl
                border-b border-white/10
                px-4 sm:px-6
                py-3
                flex justify-between items-center
            "
        >
            {/* LEFT */}
            <div className="flex items-center gap-3">
                {/* Mobile Hamburger */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="
                        lg:hidden
                        p-2 rounded-xl
                        bg-white/5 hover:bg-white/10
                        active:scale-95
                        transition
                        focus:outline-none
                        focus:ring-2 focus:ring-blue-400/60
                    "
                    aria-label="Open sidebar menu"
                >
                    <div className="space-y-1.5">
                        <span className="block w-6 h-0.5 bg-white/80" />
                        <span className="block w-6 h-0.5 bg-white/80" />
                        <span className="block w-6 h-0.5 bg-white/80" />
                    </div>
                </button>

                <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                    TAGT Dashboard
                </h1>
            </div>

            {/* RIGHT */}
            {role && (
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm capitalize
                                 bg-white/10 backdrop-blur-md border border-white/10
                                 text-gray-200">
                    {role}
                </span>
            )}
        </motion.nav>
    );
}
