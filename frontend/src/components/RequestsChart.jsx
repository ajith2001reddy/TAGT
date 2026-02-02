import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function RequestsChart({ data }) {
    return (
        <div className="bg-white/10 border border-white/10 rounded-2xl p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">
                Requests by Status
            </h3>

            {/* HARD HEIGHT CONTAINER */}
            <div className="w-full min-h-[300px] h-[300px]">
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                            dataKey="count"
                            fill="#2563eb"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
