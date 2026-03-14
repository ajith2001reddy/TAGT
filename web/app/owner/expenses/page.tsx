"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

type Expense = {
    _id: string;
    category: string;
    amount: number;
    description: string;
    date: string;
    status: string;
};

const CATEGORIES = [
    { value: "ration", label: "Ration (Groceries)" },
    { value: "vegetables", label: "Vegetables" },
    { value: "dairy", label: "Dairy (Milk/Curd)" },
    { value: "salaries", label: "Staff Salaries" },
    { value: "pg_rent", label: "PG Rent (Owner Expense)" },
    { value: "electricity", label: "Electricity Bill" },
    { value: "water", label: "Water Bill" },
    { value: "wifi", label: "WiFi/Internet" },
    { value: "maintenance", label: "Maintenance & Repairs" },
    { value: "housekeeping", label: "Housekeeping Items" },
    { value: "fuel", label: "Fuel (Gas/Diesel)" },
    { value: "bonus", label: "Bonus/Tips" },
    { value: "deposit_returned", label: "Deposit Refund" },
    { value: "others", label: "Others" }
];

export default function ExpensePage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        category: "ration",
        amount: "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
        status: "paid"
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/v2/expenses");
            setExpenses(data.data);
        } catch (e) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/v2/expenses", {
                ...formData,
                amount: Number(formData.amount)
            });
            toast.success("Expense recorded successfully");
            setShowModal(false);
            setFormData({ category: "ration", amount: "", description: "", date: new Date().toISOString().slice(0, 10), status: "paid" });
            fetchExpenses();
        } catch (e) {
            toast.error("Failed to save expense");
        }
    };

    const deleteExpense = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense record?")) return;
        try {
            await api.delete(`/v2/expenses/${id}`);
            toast.success("Record deleted");
            fetchExpenses();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="animate-fade-in p-6">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Management</div>
                    <h1 className="display-text" style={{ fontSize: "30px", marginBottom: "4px" }}>Expenses & Ration</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Direct mapping to your financial dashboard and profit/loss reports</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Record Expense
                </button>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-default)" }}>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</th>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</th>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</th>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Description</th>
                            <th style={{ padding: "16px", textAlign: "right", color: "var(--text-tertiary)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "48px", textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto", width: "24px", height: "24px", border: "2px solid #ddd", borderTopColor: "#000" }}></div></td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>No expenses recorded for this property yet.</td></tr>
                        ) : (
                            expenses.map((ex) => (
                                <tr key={ex._id} className="hover-row" style={{ borderBottom: "1px solid var(--border-default)", transition: "background 0.2s" }}>
                                    <td style={{ padding: "14px 16px", color: "var(--text-primary)", fontWeight: 500 }}>{new Date(ex.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{ 
                                            padding: "4px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 700,
                                            background: getCategoryColor(ex.category) + '15',
                                            color: getCategoryColor(ex.category),
                                            textTransform: "uppercase",
                                            letterSpacing: "0.02em",
                                            border: `1px solid ${getCategoryColor(ex.category)}25`
                                        }}>
                                            {ex.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontWeight: 700, fontSize: "14px" }}>₹{ex.amount.toLocaleString('en-IN')}</td>
                                    <td style={{ padding: "14px 16px", color: "var(--text-secondary)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.description || "-"}</td>
                                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                        <button 
                                            onClick={() => deleteExpense(ex._id)}
                                            style={{ padding: "6px", color: "#f43f5e", background: "none", border: "none", cursor: "pointer", borderRadius: "6px" }}
                                            className="hover-danger"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }}>
                    <div className="animate-fade-up" style={{ background: "var(--bg-card)", width: "100%", maxWidth: "480px", borderRadius: "28px", padding: "32px", border: "1px solid var(--border-strong)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)" }}>Record New Expense</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Category</label>
                                    <select 
                                        className="input-field"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        style={{ width: "100%" }}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Amount (₹)</label>
                                    <input 
                                        type="number"
                                        className="input-field"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Transaction Date</label>
                                <input 
                                    type="date"
                                    className="input-field"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: "32px" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", color: "var(--text-tertiary)" }}>Description / Remarks</label>
                                <textarea 
                                    className="input-field"
                                    style={{ height: "90px", resize: "none" }}
                                    placeholder="e.g. Monthly salary for cook, or electricity bill invoice #123"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "16px" }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1, padding: "14px" }} onClick={() => setShowModal(false)}>Discard</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: "14px" }}>Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .hover-row:hover {
                    background: var(--bg-subtle);
                }
                .hover-danger:hover {
                    background: rgba(244,63,94,0.1) !important;
                }
                .spinner {
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

function getCategoryColor(cat: string) {
    const map: Record<string, string> = {
        ration: "#10b981",
        vegetables: "#84cc16",
        dairy: "#06b6d4",
        salaries: "#8b5cf6",
        pg_rent: "#f59e0b",
        electricity: "#eab308",
        water: "#3b82f6",
        wifi: "#6366f1",
        maintenance: "#ec4899",
        housekeeping: "#14b8a6",
        fuel: "#f43f5e",
        bonus: "#a855f7",
        deposit_returned: "#64748b",
        others: "#94a3b8"
    };
    return map[cat] || "#94a3b8";
}
