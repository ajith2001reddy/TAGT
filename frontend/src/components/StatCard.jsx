import { motion } from "framer-motion";

export default function StatCard({ title, value }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-xl shadow p-6"
        >
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {value}
            </h3>
        </motion.div>
    );
}
