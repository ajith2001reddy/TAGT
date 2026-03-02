"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export function BarChartCard({
    title,
    data,
    dataKey,
}: {
    title: string;
    data: any[];
    dataKey: string;
}) {
    return (
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10">
            <h3 className="mb-4 font-semibold">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip />
                        <Bar dataKey={dataKey} fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}