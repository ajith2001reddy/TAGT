import { motion } from "framer-motion";

export default function Navbar() {
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
            {/* Left */}
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <h1 className="text-xl font-bold text-gray-800">
                    TAGT Dashboard
                </h1>
            </div>

            {/* Right */}
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
