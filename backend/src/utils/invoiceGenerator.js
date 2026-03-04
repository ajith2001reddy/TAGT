import PDFDocument from "pdfkit";

export const generateInvoicePDF = (payment, res) => {
    const doc = new PDFDocument({ margin: 50 });
    const amount = payment.amount || 0;
    const lateFee = payment.lateFee || 0;
    const total = payment.totalPayable || (amount + lateFee);
    const property = payment.propertyId || {};
    const resident = payment.resident || {};

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${payment._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor("#1a1a1a").text(property.name?.toUpperCase() || "RENT RECEIPT", { align: "left" });
    doc.fontSize(10).fillColor("#666").text(property.address || "");
    if (property.city) doc.text(property.city);
    if (property.phone) doc.text(`Phone: ${property.phone}`);
    if (property.gstin) doc.text(`GSTIN: ${property.gstin}`);

    doc.moveDown();
    doc.strokeColor("#eee").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Receipt Info
    const startY = doc.y;
    doc.fillColor("#1a1a1a").fontSize(12).text("RECEIPT TO", 50, startY);
    doc.fontSize(10).fillColor("#666").text(resident.name || "Resident", 50, startY + 15);
    doc.text(resident.email || "", 50, startY + 27);

    doc.fillColor("#1a1a1a").fontSize(12).text("RECEIPT DETAILS", 350, startY);
    doc.fontSize(10).fillColor("#666").text(`Receipt No: ${payment._id.toString().slice(-8).toUpperCase()}`, 350, startY + 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 350, startY + 27);
    doc.text(`Billing Month: ${payment.month}`, 350, startY + 39);
    if (payment.paidAt) {
        doc.text(`Paid At: ${new Date(payment.paidAt).toLocaleString()}`, 350, startY + 51);
    }

    doc.moveDown(4);

    // Table Header
    const tableTop = doc.y;
    doc.fillColor("#f8f9fa").rect(50, tableTop, 500, 20).fill();
    doc.fillColor("#1a1a1a").fontSize(10).text("DESCRIPTION", 60, tableTop + 6);
    doc.text("AMOUNT", 480, tableTop + 6, { align: "right", width: 60 });

    // Table Rows
    let currentY = tableTop + 25;

    // Row 1: Base Rent
    doc.fillColor("#666").text(`Monthly Rent - ${payment.month}`, 60, currentY);
    doc.text(`₹${amount.toLocaleString()}`, 480, currentY, { align: "right", width: 60 });
    currentY += 20;

    // Row 2: Late Fee (if any)
    if (lateFee > 0) {
        doc.text("Late Payment Surcharge", 60, currentY);
        doc.text(`₹${lateFee.toLocaleString()}`, 480, currentY, { align: "right", width: 60 });
        currentY += 20;
    }

    doc.strokeColor("#eee").lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;

    // Totals
    doc.fillColor("#1a1a1a").fontSize(12).text("TOTAL PAID", 350, currentY);
    doc.text(`₹${total.toLocaleString()}`, 480, currentY, { align: "right", width: 60 });

    doc.moveDown(4);

    // Footer
    if (property.pan) {
        doc.fontSize(10).fillColor("#666").text(`Landlord PAN: ${property.pan}`, { align: "left" });
    }
    doc.moveDown();
    doc.fontSize(9).fillColor("#999").text("This is a computer-generated receipt and does not require a physical signature. It can be used as a valid document for tax/HRA purposes.", { align: "center", width: 500 });

    doc.end();
};