import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import Room from "../../models/Room.js";
import Bed from "../../models/Bed.js";
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
        const payments = await Payment.find(scope).lean();

        const summary = payments.reduce((acc, p) => {
            acc.totalRevenue += (p.status === "paid" ? p.amount : 0);
            acc.outstanding += (p.status === "pending" || p.status === "overdue" ? p.amount : 0);
            acc.lateFees += (p.lateFee || 0);
            return acc;
        }, { totalRevenue: 0, outstanding: 0, lateFees: 0 });

        return res.json({ success: true, data: summary });
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
        const sheet = workbook.addWorksheet("Residents");

        sheet.columns = [
            { header: "Name", key: "name", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "Phone", key: "phone", width: 15 },
            { header: "Room", key: "room", width: 10 },
            { header: "Bed", key: "bed", width: 10 },
            { header: "Company", key: "company", width: 20 },
            { header: "Aadhaar", key: "aadhaar", width: 20 },
            { header: "Join Date", key: "joinDate", width: 15 },
            { header: "Status", key: "status", width: 12 },
        ];

        residents.forEach(r => {
            sheet.addRow({
                name: r.name,
                email: r.email,
                phone: r.phoneNumber,
                room: r.roomId?.roomNumber || "N/A",
                bed: r.bedId?.bedNumber || "N/A",
                company: r.companyName || "",
                aadhaar: r.aadhaarNumber || "",
                joinDate: r.leaseStart ? new Date(r.leaseStart).toLocaleDateString() : "",
                status: r.status
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=residents-report.xlsx");
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

