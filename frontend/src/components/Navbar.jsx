import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
    const { user } = useAuth();
    const role = user?.role;

    return (
        <motion.nav
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="
                bg-gray-900/90 backdrop-blur
                border-b border-white/10
                px-4 sm:px-6
                py-3
                flex justify-between items-center
                pt-safe
            "
        >
            <div className="flex items-center gap-3">
                {/* Mobile Hamburger */}
                <button
                    onClick={onMenuClick}
                    className="
                        md:hidden
                        p-2 rounded-lg
                        hover:bg-white/10
                        active:scale-95
                        transition
                    "
                    aria-label="Open menu"
                >
                    <div className="space-y-1">
                        <span className="block w-6 h-0.5 bg-gray-200" />
                        <span className="block w-6 h-0.5 bg-gray-200" />
                        <span className="block w-6 h-0.5 bg-gray-200" />
                    </div>
                </button>

                <h1 className="text-lg sm:text-xl font-semibold text-gray-100">
                    TAGT Dashboard
                </h1>
            </div>

            {role && (
                <span className="text-xs sm:text-sm capitalize text-gray-400">
                    {role}
                </span>
            )}
        </motion.nav>
    );
}
