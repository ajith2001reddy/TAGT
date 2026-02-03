import { motion } from "framer-motion";

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    accent = "blue"
}) {
    const accentMap = {
        blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        green: "bg-green-500/20 text-green-400 border-green-500/30",
        red: "bg-red-500/20 text-red-400 border-red-500/30",
        yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="
                glass
                rounded-2xl
                p-4 sm:p-6
                text-white
                transition-all
            "
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                        {title}
                    </p>

                    <h3 className="text-2xl sm:text-3xl font-semibold mt-2 break-all">
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
                            border
                            backdrop-blur-md
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
