import { motion } from "framer-motion";

/**
 * STAT CARD (MOBILE SAFE)
 * - Dark theme friendly
 * - Responsive typography
 * - No hover jank on mobile
 */

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    accent = "blue"
}) {
    const accentMap = {
        blue: "bg-blue-600/20 text-blue-400",
        green: "bg-green-600/20 text-green-400",
        red: "bg-red-600/20 text-red-400",
        yellow: "bg-yellow-600/20 text-yellow-400"
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="
                bg-white/10 border border-white/10
                rounded-2xl
                p-4 sm:p-6
                shadow-sm hover:shadow-md
                transition
                text-gray-100
            "
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                        {title}
                    </p>

                    <h3 className="text-2xl sm:text-3xl font-bold mt-2 break-all">
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
                        className={`
                            flex-shrink-0
                            h-10 w-10 sm:h-12 sm:w-12
                            rounded-xl
                            flex items-center justify-center
                            ${accentMap[accent]}
                        `}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
