import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getKPIs } from "../services/analyticsService";

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
        } catch {
            setKpis(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="glass h-28 rounded-2xl animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!kpis) {
        return (
            <div className="glass rounded-2xl p-6 text-center text-gray-400">
                Unable to load KPI data
            </div>
        );
    }

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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.35,
                        delay: index * 0.06,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="glass rounded-2xl p-5 sm:p-6"
                >
                    <p className="text-xs sm:text-sm text-gray-400 truncate">
                        {card.title}
                    </p>

                    <h2 className="text-3xl sm:text-4xl font-semibold text-white mt-2">
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
