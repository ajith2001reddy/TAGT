import { motion } from "framer-motion";

export default function Navbar({ onMenuClick }) {
    const role = localStorage.getItem("role");

    return (
        <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow px-6 py-4 flex justify-between items-center"
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded hover:bg-gray-100"
                >
                    <div className="space-y-1">
                        <span className="block w-6 h-0.5 bg-gray-800" />
                        <span className="block w-6 h-0.5 bg-gray-800" />
                        <span className="block w-6 h-0.5 bg-gray-800" />
                    </div>
                </button>

                <h1 className="text-xl font-bold text-gray-800">
                    TAGT Dashboard
                </h1>
            </div>

            <span className="text-sm capitalize text-gray-600">
                {role}
            </span>
        </motion.nav>
    );
}
