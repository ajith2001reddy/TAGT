"use client";

import { useEffect, useState } from "react";
import { useOwnerStats } from "@/features/owner/useOwnerStats";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
    Users, 
    Home, 
    AlertCircle, 
    TrendingUp, 
    CreditCard, 
    FileText, 
    Plus, 
    ChevronRight,
    Search
} from "lucide-react";

export default function OwnerClient() {
    const { stats, detailed, loading } = useOwnerStats();
    const { dbUser, refreshUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        refreshUser();
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    if (loading) return (
        <div style={{ padding: "40px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "24px" }} />)}
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ paddingBottom: "80px" }}>
            {/* SEARCH HUB */}
            <div style={{ 
                marginBottom: "40px", 
                position: "relative",
                maxWidth: "600px"
            }}>
                <Search size={20} style={{ position: "absolute", left: "20px", top: "18px", color: "var(--text-tertiary)" }} />
                <input 
                    className="input-field" 
                    placeholder="Find a resident, room, or payment..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ 
                        padding: "16px 20px 16px 52px", 
                        borderRadius: "100px", 
                        fontSize: "16px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)"
                    }} 
                />
            </div>

            {/* HEADER */}
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "32px", marginBottom: "8px" }}>{greeting}, {dbUser?.name?.split(" ")[0]}</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                        It&apos;s {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}. Here&apos;s what needs your attention.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    
                    {/* QUiCK ACTIONS */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        <QuickActionCard 
                            label="Add Resident" 
                            icon={<Plus size={20} />} 
                            href="/owner/residents" 
                            color="var(--accent-primary)" 
                        />
                        <QuickActionCard 
                            label="Record Payment" 
                            icon={<CreditCard size={20} />} 
                            href="/owner/money" 
                            color="#34d399" 
                        />
                        <QuickActionCard 
                            label="Add Expense" 
                            icon={<Plus size={20} />} 
                            href="/owner/money" 
                            color="#fbbf24" 
                        />
                    </div>

                    {/* FINANCIAL SNAPSHOT */}
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Financial Ledger</h3>
                            <Link href="/owner/money" style={{ fontSize: "13px", color: "var(--accent-primary)", fontWeight: 700, textDecoration: "none" }}>View Full Ledger →</Link>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                            <StatItem label="Collected Today" value={`₹${stats?.monthlyRevenue ? (stats.monthlyRevenue / 30).toFixed(0) : '0'}`} color="#34d399" />
                            <StatItem label="Expenses Today" value="₹1,200" color="#ff5252" />
                            <StatItem label="Estimated Profit" value={`₹${stats?.monthlyRevenue ? (stats.monthlyRevenue / 30 - 1200).toFixed(0) : '0'}`} color="var(--accent-primary)" />
                        </div>
                    </div>

                    {/* ALERTS / NOTIFICATIONS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Priority Alerts</h3>
                        {(stats?.overduePayments ?? 0) > 0 && (
                            <AlertBar 
                                icon={<AlertCircle size={18} />} 
                                message={`${stats?.overduePayments ?? 0} Residents haven't paid rent this month.`} 
                                action="Remind All"
                                color="var(--red)" 
                            />
                        )}
                        <AlertBar 
                            icon={<FileText size={18} />} 
                            message="2 Leases are expiring in the next 7 days." 
                            action="View Leases"
                            color="#fbbf24" 
                        />
                         <AlertBar 
                            icon={<Users size={18} />} 
                            message="3 Residents have pending document uploads." 
                            action="Request Info"
                            color="var(--accent-primary)" 
                        />
                    </div>
                </div>

                {/* RIGHT SIDE: OCCUPANCY & QUICK LISTS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div className="glass-card" style={{ padding: "32px", borderRadius: "32px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
                            <span style={{ fontSize: "40px", fontWeight: 800 }}>{stats?.occupancyRate}%</span>
                            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>Occupied</span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden", marginBottom: "24px" }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats?.occupancyRate}%` }}
                                style={{ height: "100%", background: "var(--accent-primary)", borderRadius: "100px" }} 
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)", fontSize: "13px" }}>
                            <span>{(detailed?.totalBeds ?? 0) - (detailed?.occupiedBeds ?? 0)} Vacant Beds</span>
                            <span>{detailed?.occupiedBeds ?? 0} Residents</span>
                        </div>
                        <Link href="/owner/rooms" className="btn-primary" style={{ width: "100%", marginTop: "24px", justifyContent: "center" }}>
                            Go to Rooms
                        </Link>
                    </div>

                    <div className="glass-card" style={{ padding: "24px", borderRadius: "24px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Recent Activity</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Shortened activity list for PGs */}
                            <ActivityItem label="Rahul Kumar" sub="Paid ₹8,500" time="2h ago" />
                            <ActivityItem label="Ration Purchase" sub="-₹420 (Milk/Veg)" time="4h ago" />
                            <ActivityItem label="Room 204" sub="New Resident Joined" time="6h ago" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface QuickActionProps { label: string; icon: React.ReactNode; href: string; color: string; }
function QuickActionCard({ label, icon, href, color }: QuickActionProps) {
    return (
        <Link href={href} style={{ textDecoration: "none" }}>
            <motion.div 
                whileHover={{ y: -4, background: "rgba(255,255,255,0.05)" }}
                className="glass-card" 
                style={{ 
                    padding: "20px", 
                    borderRadius: "24px", 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "12px",
                    border: "1px solid var(--border-subtle)"
                }}
            >
                <div style={{ 
                    width: "40px", height: "40px", borderRadius: "12px", 
                    background: `${color}15`, color, 
                    display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
            </motion.div>
        </Link>
    );
}

interface StatItemProps { label: string; value: string; color: string; }
function StatItem({ label, value, color }: StatItemProps) {
    return (
        <div>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color }}>{value}</div>
        </div>
    );
}

interface AlertBarProps { icon: React.ReactNode; message: string; action: string; color: string; }
function AlertBar({ icon, message, action, color }: AlertBarProps) {
    return (
        <div style={{ 
            background: "rgba(255,255,255,0.02)", 
            border: "1px solid var(--border-subtle)",
            padding: "16px 20px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color }}>{icon}</div>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{message}</span>
            </div>
            <button className="btn-ghost" style={{ fontSize: "11px", padding: "6px 12px", color }}>
                {action}
            </button>
        </div>
    );
}

interface ActivityItemProps { label: string; sub: string; time: string; }
function ActivityItem({ label, sub, time }: ActivityItemProps) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{sub}</div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{time}</div>
        </div>
    );
}
