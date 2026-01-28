import { motion } from "framer-motion";

/**
 * STAT CARD (SaaS GRADE)
 * - Supports icon
 * - Supports trend / subtitle
 * - Works for money, counts, status
 */

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    accent = "blue"
}) {
    const accentMap = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        yellow: "bg-yellow-50 text-yellow-600"
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                {icon && (
                    <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${accentMap[accent]}`}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
