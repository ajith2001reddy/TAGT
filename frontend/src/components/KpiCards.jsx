import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getKPIs } from "../services/analyticsService";

/* =====================================================
   KPI CARDS – MOBILE SAFE
===================================================== */

export default function KpiCards() {
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKPIs();
    }, []);

    const loadKPIs = async () => {
        try {
            setLoading(true);
            const data = await getKPIs();
            setKpis(data);
        } catch (err) {
            console.error("KPI LOAD ERROR", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white/10 h-24 sm:h-28 rounded-xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!kpis) return null;

    const cards = [
        {
            title: "Occupancy",
            value: `${kpis.occupancy.rate}%`,
            subtitle: `${kpis.occupancy.occupiedBeds} / ${kpis.occupancy.totalBeds} beds`
        },
        {
            title: "Payment Collection",
            value: `${kpis.payments.collectionRate}%`,
            subtitle: `$${kpis.payments.totalCollected} collected`
        },
        {
            title: "Avg Resolution Time",
            value: `${kpis.maintenance.avgResolutionTime} hrs`,
            subtitle: `${kpis.maintenance.resolvedCount} resolved`
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6"
                >
                    <p className="text-xs sm:text-sm text-gray-400 truncate">
                        {card.title}
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-bold mt-2 break-all">
                        {card.value}
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        {card.subtitle}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
