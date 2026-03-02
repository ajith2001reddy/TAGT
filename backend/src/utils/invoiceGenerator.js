import PDFDocument from "pdfkit";

export const generateInvoicePDF = (payment, res) => {
    const doc = new PDFDocument({ margin: 40 });
    const amount =
        payment.totalPayable ??
        payment.amount ??
        payment.baseAmount ??
        0;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${payment._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("RENT INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Invoice ID: ${payment._id}`);
    doc.text(`Resident: ${payment.resident?.name || payment.resident?.email || "Unknown"}`);
    doc.text(`Amount: ₹${Number(amount).toLocaleString()}`);
    doc.text(`Month: ${payment.month}`);
    doc.text(`Due Date: ${new Date(payment.dueDate).toDateString()}`);
    doc.text(`Status: ${payment.status}`);

    if (payment.paidAt) {
        doc.text(`Paid On: ${new Date(payment.paidAt).toDateString()}`);
    }

    doc.moveDown();
    doc.text("Thank you for your payment.", { align: "center" });

    doc.end();
};