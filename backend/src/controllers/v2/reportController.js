import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import Room from "../../models/Room.js";
import Bed from "../../models/Bed.js";
import Expense from "../../models/Expense.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/**
 * Helper to build CSV/Excel strings
 */
const esc = v => { const s = String(v ?? "").replace(/"/g, '""'); return /[",\n]/.test(s) ? `"${s}"` : s; };
const csv = (headers, rows) => [headers, ...rows.map(r => r.map(esc))].map(r => r.join(",")).join("\n");

/**
 * 1. Resident Report (JSON)
 */
export const getResidentsReport = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const residents = await User.find({ role: "resident", ...scope })
            .populate("roomId", "roomNumber rent")
            .populate("bedId", "bedNumber")
            .lean();

        return res.json({ success: true, data: residents });
    } catch (err) { next(err); }
};

/**
 * 2. Rent Collection Report (JSON Aggregation)
 */
export const getRentReport = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { month } = req.query;
        const filter = { ...scope, type: "rent", ...(month ? { month } : {}) };

        const stats = await Payment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$status",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.json({ success: true, data: stats });
    } catch (err) { next(err); }
};

/**
 * 3. Occupancy Report (JSON)
 */
export const getOccupancyReport = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const rooms = await Room.find(scope).lean();

        const totalBeds = rooms.reduce((acc, r) => acc + (r.totalBeds || 0), 0);
        const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0);
        const maintenanceBeds = rooms.reduce((acc, r) => acc + (r.maintenanceMode ? r.totalBeds : 0), 0);

        return res.json({
            success: true,
            data: {
                totalBeds,
                occupiedBeds,
                availableBeds: totalBeds - occupiedBeds - maintenanceBeds,
                maintenanceBeds,
                occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0
            }
        });
    } catch (err) { next(err); }
};

/**
 * 4. Financial Dashboard (JSON)
 */
export const getFinancialReport = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { month } = req.query;
        const currentMonth = month || new Date().toISOString().slice(0, 7);

        const [payments, expenses] = await Promise.all([
            Payment.find({ ...scope, month: currentMonth }).lean(),
            Expense.find({ ...scope, date: { 
                $gte: new Date(currentMonth + "-01"), 
                $lt: new Date(new Date(currentMonth + "-01").setMonth(new Date(currentMonth + "-01").getMonth() + 1)) 
            }}).lean()
        ]);

        const income = payments.reduce((acc, p) => {
            if (p.status !== "paid") return acc;
            const type = p.type === 'rent' ? 'rental' : p.type;
            acc[type] = (acc[type] || 0) + p.amount;
            acc.total += p.amount;
            return acc;
        }, { total: 0 });

        const expenseCategories = {
            fixed: ["salaries", "others", "pg_rent", "wifi"],
            variable: ["ration", "vegetables", "dairy", "maintenance", "deposit_returned", "electricity", "water", "fuel", "bonus", "housekeeping"]
        };

        const expenseBreakdown = expenses.reduce((acc, e) => {
            const cat = e.category || 'others';
            acc[cat] = (acc[cat] || 0) + e.amount;
            acc.total += e.amount;
            
            if (expenseCategories.fixed.includes(cat)) acc.fixedTotal += e.amount;
            else acc.variableTotal += e.amount;
            
            return acc;
        }, { total: 0, fixedTotal: 0, variableTotal: 0 });

        return res.json({ 
            success: true, 
            data: {
                month: currentMonth,
                income,
                expenses: expenseBreakdown,
                profit: income.total - expenseBreakdown.total
            } 
        });
    } catch (err) { next(err); }
};

/**
 * 5. Export Residents (Excel)
 */
export const exportResidentsExcel = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const residents = await User.find({ role: "resident", ...scope })
            .populate("roomId", "roomNumber")
            .populate("bedId", "bedNumber")
            .lean();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Master List");

        sheet.columns = [
            { header: "Sr. No.", key: "srNo", width: 8 },
            { header: "Full Name", key: "name", width: 25 },
            { header: "Room No.", key: "room", width: 12 },
            { header: "Gender", key: "gender", width: 10 },
            { header: "Mobile Number", key: "phone", width: 18 },
            { header: "Alternate Number", key: "altPhone", width: 18 },
            { header: "Relation", key: "relation", width: 15 },
            { header: "Company Name", key: "company", width: 20 },
            { header: "Adhaar Card Number", key: "aadhaar", width: 22 },
        ];

        residents.forEach((r, idx) => {
            sheet.addRow({
                srNo: idx + 1,
                name: r.name,
                room: r.roomId?.roomNumber || "N/A",
                gender: r.gender || "",
                phone: r.phoneNumber || "",
                altPhone: r.alternateNumber || "",
                relation: r.relation || "",
                company: r.companyName || "",
                aadhaar: r.aadhaarNumber || "",
            });
        });

        // Style header
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=master-residents.xlsx");
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) { next(err); }
};

/**
 * 6. Export Payments (Excel)
 */
export const exportPaymentsExcel = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { month } = req.query;
        const filter = { ...scope, ...(month ? { month } : {}) };

        const payments = await Payment.find(filter)
            .populate("resident", "name email")
            .sort({ month: -1, createdAt: -1 })
            .lean();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Rent Collection");

        sheet.columns = [
            { header: "Month", key: "month", width: 12 },
            { header: "Resident", key: "name", width: 25 },
            { header: "Type", key: "type", width: 12 },
            { header: "Amount", key: "amount", width: 15 },
            { header: "Late Fee", key: "lateFee", width: 12 },
            { header: "Total", key: "total", width: 15 },
            { header: "Status", key: "status", width: 12 },
            { header: "Paid At", key: "paidAt", width: 18 },
        ];

        payments.forEach(p => {
            sheet.addRow({
                month: p.month,
                name: p.resident?.name || "N/A",
                type: p.type,
                amount: p.amount,
                lateFee: p.lateFee || 0,
                total: p.totalPayable || p.amount,
                status: p.status,
                paidAt: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : ""
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=payments-report-${month || "all"}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) { next(err); }
};

/**
 * 7. Export Rent Receipt (PDF)
 */
export const exportRentReceiptPDF = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id)
            .populate("resident", "name email phoneNumber")
            .populate("room", "roomNumber")
            .populate("propertyId", "name address")
            .lean();

        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        const doc = new PDFDocument({ margin: 50, size: "A5" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=receipt-${payment.month}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(16).text(payment.propertyId?.name || "TAGT", { align: "center" });
        doc.fontSize(10).text("Rent Receipt", { align: "center" });
        doc.moveDown();

        doc.fontSize(12).text(`Receipt No: REC-${payment._id.toString().slice(-6).toUpperCase()}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        doc.text(`Resident: ${payment.resident?.name}`);
        doc.text(`Room: ${payment.room?.roomNumber || "N/A"}`);
        doc.text(`Period: ${payment.month}`);
        doc.moveDown();

        doc.fontSize(14).text(`Amount Paid: ₹${(payment.totalPayable || payment.amount).toLocaleString()}`, { align: "right" });
        doc.fontSize(10).text(`Status: ${payment.status.toUpperCase()}`, { align: "right" });

        doc.moveDown(2);
        doc.fontSize(8).text("This is a computer generated receipt.", { align: "center", color: "grey" });

        doc.end();
    } catch (err) { next(err); }
};

/**
 * 8. Export Expenses (Excel - Ration, Utilities, etc)
 */
export const exportExpensesExcel = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { startDate, endDate } = req.query;

        const filter = { ...scope };
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Expenses & Ration");

        sheet.columns = [
            { header: "Date", key: "date", width: 15 },
            { header: "Category", key: "category", width: 15 },
            { header: "Amount", key: "amount", width: 12 },
            { header: "Description", key: "description", width: 30 },
            { header: "Status", key: "status", width: 12 },
        ];

        expenses.forEach(e => {
            sheet.addRow({
                date: new Date(e.date).toLocaleDateString(),
                category: e.category.toUpperCase(),
                amount: e.amount,
                description: e.description || "",
                status: e.status
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=expenses-report.xlsx");
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) { next(err); }
};

// Legacy CSV exports (kept for compatibility)
export const reportMonthlyRevenue = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { month } = req.query;
        const filter = { ...scope, status: "paid", ...(month ? { month } : {}) };
        const payments = await Payment.find(filter).populate("resident", "name email").lean();
        const content = csv(["Month", "Resident", "Email", "Amount", "Total", "Paid On"], payments.map(p => [p.month, p.resident?.name, p.resident?.email, p.amount, p.totalPayable, p.paidAt]));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=revenue-${month || "all"}.csv`);
        return res.send(content);
    } catch (err) { next(err); }
};

export const reportOutstanding = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const payments = await Payment.find({ ...scope, status: { $in: ["pending", "overdue"] } }).populate("resident", "name").lean();
        const content = csv(["Resident", "Month", "Amount", "Due Date"], payments.map(p => [p.resident?.name, p.month, p.amount, p.dueDate]));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=outstanding.csv");
        return res.send(content);
    } catch (err) { next(err); }
};

export const reportResidentLedger = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const { residentId } = req.query;
        const filter = { ...scope, ...(residentId ? { resident: residentId } : {}) };
        const payments = await Payment.find(filter).populate("resident", "name").lean();
        const content = csv(["Date", "Type", "Month", "Amount", "Status"], payments.map(p => [p.createdAt, p.type, p.month, p.amount, p.status]));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=ledger.csv");
        return res.send(content);
    } catch (err) { next(err); }
};

