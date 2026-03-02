"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function RevenueTrendChart({ data }: { data: any[] }) {
    return (
        <div style={{ height: 300, width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}
                        labelStyle={{ color: 'var(--text-tertiary)', fontSize: 11, marginBottom: 4 }}
                        formatter={(v: any) => [`₹${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="collected"
                        stroke="url(#lineGradient)"
                        strokeWidth={4}
                        dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: 'var(--bg-card)' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function OccupancyPieChart({ occupied, total }: { occupied: number, total: number }) {
    const data = [
        { name: 'Occupied', value: occupied, color: 'var(--accent-primary)' },
        { name: 'Available', value: Math.max(0, total - occupied), color: 'rgba(255,255,255,0.05)' }
    ];

    return (
        <div style={{ height: 220, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {total ? Math.round((occupied / total) * 100) : 0}%
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Full
                </div>
            </div>
        </div>
    );
}
