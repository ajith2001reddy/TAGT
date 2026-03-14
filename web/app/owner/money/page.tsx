"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown, Search, Loader2, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";

interface Transaction {
    _id: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    name?: string;
    description?: string;
    date: string;
    residentName?: string;
}

export default function MoneyLedgerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [addType, setAddType] = useState<"income" | "expense">("income");
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        category: "Rent",
        name: "",
        amount: "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const [payments, expenses] = await Promise.all([
                api.get("/v2/payments"),
                api.get("/v2/expenses")
            ]);

            const mappedPayments = (payments.data?.data || []).map((p: Transaction & { residentId?: { name: string }, type: string, paidAt: string, createdAt: string, month: string }) => ({
                _id: p._id,
                type: "income",
                category: p.type || "Rent",
                amount: p.amount,
                name: p.residentId?.name || "Resident",
                description: p.month || "",
                date: p.paidAt || p.createdAt,
            }));

            const mappedExpenses = (expenses.data?.data || []).map((e: Transaction) => ({
                _id: e._id,
                type: "expense",
                category: e.category,
                amount: e.amount,
                name: e.name || e.category,
                description: e.description || "",
                date: e.date,
            }));

            const combined = [...mappedPayments, ...mappedExpenses].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setTransactions(combined);
        } catch {
            toast.error("Failed to load ledger");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = addType === "income" ? "/v2/payments" : "/v2/expenses";
        const payload = addType === "income" ? {
            amount: Number(form.amount),
            type: form.category,
            month: form.description || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            residentId: form.name // In a real app we'd have a dropdown here
        } : {
            ...form,
            amount: Number(form.amount)
        };

        try {
            await api.post(endpoint, payload);
            toast.success(`${addType === 'income' ? 'Sale' : 'Expense'} recorded`);
            setShowAdd(false);
            fetchLedger();
        } catch (err: unknown) {
            const message = err instanceof Error ? (err as Record<string, unknown> & Error).message : "Record failed";
            toast.error(message);
        }
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const filtered = transactions.filter(t => 
        t.name?.toLowerCase().includes(search.toLowerCase()) || 
        t.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
                <div>
                    <h1 className="display-text" style={{ fontSize: "28px", marginBottom: "8px" }}>Money & Ledger</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Simplified financial stream of your income and expenses.</p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button className="btn-secondary" onClick={() => { setAddType("expense"); setShowAdd(true); }} style={{ gap: "8px" }}>
                        <TrendingDown size={18} /> Record Expense
                    </button>
                    <button className="btn-primary" onClick={() => { setAddType("income"); setShowAdd(true); }} style={{ gap: "8px" }}>
                        <TrendingUp size={18} /> Record Payment
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <FinanceCard title="Total Cash In" value={`₹${totalIncome.toLocaleString()}`} color="#34d399" icon={<TrendingUp size={20} />} />
                <FinanceCard title="Total Cash Out" value={`₹${totalExpense.toLocaleString()}`} color="#ff5252" icon={<TrendingDown size={20} />} />
                <FinanceCard title="Net Balance" value={`₹${(totalIncome - totalExpense).toLocaleString()}`} color="var(--accent-primary)" icon={<DollarSign size={20} />} />
            </div>

            <div className="glass-card" style={{ borderRadius: "24px", overflow: "hidden" }}>
                <div style={{ padding: "24px", display: "flex", gap: "16px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "16px", top: "12px", color: "var(--text-tertiary)" }} />
                        <input 
                            className="input-field" 
                            placeholder="Search ledger entries..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: "44px" }}
                        />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-subtle)" }}>
                            {["Date", "Entity / Item", "Category", "Amount", "Type"].map(h => (
                                <th key={h} style={{ padding: "16px 24px", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "60px", textAlign: "center" }}><Loader2 className="animate-spin" style={{ margin: "0 auto" }} /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "60px", textAlign: "center", color: "var(--text-tertiary)" }}>No financial records found.</td></tr>
                        ) : filtered.map(t => (
                            <tr key={t._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-tertiary)" }}>
                                    {new Date(t.date).toLocaleDateString()}
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t.description}</div>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: "13px" }}>
                                    {t.category}
                                </td>
                                <td style={{ padding: "16px 24px", fontWeight: 700, color: t.type === 'income' ? '#34d399' : '#ff5252' }}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <span style={{ 
                                        padding: "4px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 800,
                                        background: t.type === 'income' ? 'rgba(52,211,153,0.1)' : 'rgba(255,82,82,0.1)',
                                        color: t.type === 'income' ? '#34d399' : '#ff5252'
                                    }}>
                                        {t.type.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAdd && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div className="glass-card animate-fade-up" style={{ padding: "32px", width: "480px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>Record {addType === 'income' ? 'Income' : 'Expense'}</h2>
                        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>NAME / ITEM</label>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder={addType === 'income' ? 'Resident Name' : 'Item or Person'} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>AMOUNT (₹)</label>
                                    <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" placeholder="0.00" required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>CATEGORY</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                                        {addType === 'income' ? (
                                            <>
                                                <option value="Rent">Monthly Rent</option>
                                                <option value="Deposit">Security Deposit</option>
                                                <option value="Food">Food / Tiffin</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Ration">Ration (Groceries)</option>
                                                <option value="Salary">Staff Salary</option>
                                                <option value="Utilities">WiFi / Electricity</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px" }}>REMARKS</label>
                                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" placeholder="Optional notes..." />
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Discard</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface FinanceCardProps { title: string; value: string; color: string; icon: React.ReactNode; }
function FinanceCard({ title, value, color, icon }: FinanceCardProps) {
    return (
        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px", borderRadius: "20px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: "24px", fontWeight: 800 }}>{value}</div>
            </div>
        </div>
    );
}
