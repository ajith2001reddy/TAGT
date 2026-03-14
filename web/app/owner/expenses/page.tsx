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
            toast.success("Expense recorded");
            setShowModal(false);
            setFormData({ category: "ration", amount: "", description: "", date: new Date().toISOString().slice(0, 10), status: "paid" });
            fetchExpenses();
        } catch (e) {
            toast.error("Failed to save expense");
        }
    };

    const deleteExpense = async (id: string) => {
        if (!confirm("Delete this record?")) return;
        try {
            await api.delete(`/v2/expenses/${id}`);
            toast.success("Deleted");
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
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Track food, utilities, and maintenance costs</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <span>+</span> Record Expense
                </button>
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "18px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,1.01)", borderBottom: "1px solid var(--border-default)" }}>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                            <th style={{ padding: "16px", textAlign: "left", color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</th>
                            <th style={{ padding: "16px", textAlign: "right", color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center" }}>Loading records...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>No expenses recorded yet.</td></tr>
                        ) : (
                            expenses.map((ex) => (
                                <tr key={ex._id} style={{ borderBottom: "1px solid var(--border-default)" }}>
                                    <td style={{ padding: "16px" }}>{new Date(ex.date).toLocaleDateString()}</td>
                                    <td style={{ padding: "16px" }}>
                                        <span style={{ 
                                            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                                            background: ex.category === 'ration' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                            color: ex.category === 'ration' ? '#10b981' : '#3b82f6',
                                            textTransform: "uppercase"
                                        }}>
                                            {ex.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px", fontWeight: 700 }}>₹{ex.amount.toLocaleString()}</td>
                                    <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{ex.description || "-"}</td>
                                    <td style={{ padding: "16px", textAlign: "right" }}>
                                        <button 
                                            onClick={() => deleteExpense(ex._id)}
                                            style={{ color: "#f43f5e", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="animate-fade-up" style={{ background: "var(--bg-page)", width: "100%", maxWidth: "450px", borderRadius: "24px", padding: "32px", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-2xl)" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", fontFamily: "var(--font-display)" }}>Record New Expense</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Category</label>
                                <select 
                                    className="input-field"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="ration">Ration (Food/Grocery)</option>
                                    <option value="electricity">Electricity</option>
                                    <option value="water">Water Bill</option>
                                    <option value="maintenance">Maintenance/Repairs</option>
                                    <option value="salary">Staff Salary</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Amount (₹)</label>
                                <input 
                                    type="number"
                                    className="input-field"
                                    placeholder="Enter amount"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Date</label>
                                <input 
                                    type="date"
                                    className="input-field"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: "32px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Description</label>
                                <textarea 
                                    className="input-field"
                                    style={{ height: "80px", resize: "none" }}
                                    placeholder="e.g. Monthly grocery from DMart"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
