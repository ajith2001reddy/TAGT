import { motion } from "framer-motion";

/**
 * Navbar
 * - Shared for Admin & Resident
 * - Hamburger menu support
 * - Keeps existing design & animation
 */

export default function Navbar({ onMenuClick }) {
    const role = localStorage.getItem("role");

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-md px-6 py-4 flex justify-between items-center"
        >
            {/* LEFT */}
            <div className="flex items-center gap-4">
                {/* 🍔 Hamburger (mobile only) */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <div className="space-y-1">
                        <span className="block w-6 h-0.5 bg-gray-800" />
                        <span className="block w-6 h-0.5 bg-gray-800" />
                        <span className="block w-6 h-0.5 bg-gray-800" />
                    </div>
                </button>

                {/* Logo / Title */}
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <h1 className="text-xl font-bold text-gray-800">
                        TAGT Dashboard
                    </h1>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600 capitalize">
                    {role}
                </span>

                <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </motion.nav>
    );
}
