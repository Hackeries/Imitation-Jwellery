import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AddressInfo, Invoice } from "@/types/index";
import { INVOICE_COLORS } from "@/constants";
interface JsPDFWithPlugin extends jsPDF {
  lastAutoTable: { finalY: number };
}

const BILLING_ADDRESS: AddressInfo = {
  fullName: "Privora (Warehouse)",
  line1: "Plot No. 45, Phoenix Industrial Estate",
  line2: "Viman Nagar",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411014",
  country: "India",
  mobile: "+91 80000 12345",
};

export const generateInvoice = (order: Invoice) => {
  const doc = new jsPDF() as JsPDFWithPlugin;

  const brandColor = INVOICE_COLORS.BRAND;
  const black = "#1A1A1A";
  const gray = INVOICE_COLORS.GRAY;

  doc.setFontSize(28);
  doc.setTextColor(brandColor);
  doc.setFont("helvetica", "bold");
  doc.text("PRIVORA", 15, 25);

  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.setFont("helvetica", "normal");
  doc.text("A DROP OF SHINE", 15, 32);

  doc.setFontSize(22);
  doc.setTextColor(black);
  doc.text("INVOICE", 200, 25, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.text(`Invoice No: #INV-${order.orderNumber.slice(-6).toUpperCase()}`, 200, 35, { align: "right" });
  doc.text(`Date: ${order.date || "N/A"}`, 200, 40, { align: "right" });

  doc.setDrawColor(139, 110, 78);
  doc.setLineWidth(1);
  doc.line(15, 50, 195, 50);

  const yAddress = 60;
  doc.setFontSize(11);
  doc.setTextColor(brandColor);
  doc.setFont("helvetica", "bold");
  doc.text("ISSUED BY:", 15, yAddress);
  doc.text("DELIVER TO:", 110, yAddress);

  doc.setFontSize(10);
  doc.setTextColor(black);
  doc.setFont("helvetica", "normal");

  const printAddress = (x: number, y: number, addr: AddressInfo) => {
    let currentY = y + 7;
    const lineHeight = 5;
    const maxWidth = 80;

    const printLine = (text: string, isBold = false) => {
      if (!text) return;
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, x, currentY);
      currentY += lineHeight * splitText.length;
    };

    printLine(addr.fullName, true);
    printLine(addr.line1);
    if (addr.line2) printLine(addr.line2);
    printLine(`${addr.city}, ${addr.state} ${addr.pincode}`);
    printLine(addr.country);
    printLine(`Phone: ${addr.mobile}`);
  };

  printAddress(15, yAddress, BILLING_ADDRESS);
  printAddress(110, yAddress, order.shippingAddress);

  const tableColumn = ["Product Description", "Qty", "Unit Price", "Amount"];
  const tableRows = order.items.map(item => {
    const unitPrice = item.totalPrice / item.quantity;
    return [
      item.productName,
      item.quantity,
      `Rs. ${unitPrice.toLocaleString("en-IN")}`,
      `Rs. ${item.totalPrice.toLocaleString("en-IN")}`,
    ];
  });

  autoTable(doc, {
    startY: 110,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  let currentYSummary = doc.lastAutoTable.finalY + 15;
  const labelX = 135;
  const valueX = 195;

  doc.setFontSize(10);
  doc.setTextColor(gray);

  const addSummaryRow = (label: string, value: string, isBold = false, color = black) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color);
    doc.text(label, labelX, currentYSummary);
    doc.text(value, valueX, currentYSummary, { align: "right" });
    currentYSummary += 7;
  };

  addSummaryRow("Subtotal:", `Rs. ${order.financials.subtotal.toLocaleString("en-IN")}`);
  addSummaryRow("Shipping:", order.financials.shipping === 0 ? "Free Shipping" : `Rs. ${order.financials.shipping}`);

  if (order.financials.tax) {
    addSummaryRow("Estimated GST:", `Rs. ${order.financials.tax.toLocaleString("en-IN")}`);
  }

  if (order.financials.discount > 0) {
    const couponText = order.financials.couponCode ? `Discount (${order.financials.couponCode}):` : "Total Discount:";
    addSummaryRow(couponText, `- Rs. ${order.financials.discount.toLocaleString("en-IN")}`, false, "#16a34a");
  }

  currentYSummary += 2;
  doc.setDrawColor(200);
  doc.line(labelX, currentYSummary, valueX, currentYSummary);
  currentYSummary += 8;

  doc.setFontSize(14);
  doc.setTextColor(brandColor);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER TOTAL:", labelX, currentYSummary);
  doc.text(`Rs. ${order.financials.total.toLocaleString("en-IN")}`, valueX, currentYSummary, { align: "right" });

  const pageHeight = doc.internal.pageSize.height;

  doc.setFontSize(8);
  doc.setTextColor(gray);
  doc.setFont("helvetica", "normal");
  doc.text("Return Policy: 7-day hassle-free returns on non-personalized jewelry.", 15, pageHeight - 35);
  doc.text("Care Instructions: Keep away from moisture and store in an airtight container.", 15, pageHeight - 31);

  doc.setDrawColor(230);
  doc.line(15, pageHeight - 25, 195, pageHeight - 25);
  doc.setFontSize(9);
  doc.text("Thank you for choosing Privora — Where every piece tells a story.", 105, pageHeight - 18, {
    align: "center",
  });
  doc.setFontSize(7);
  doc.text("COMPUTER GENERATED INVOICE - NO SIGNATURE REQUIRED", 105, pageHeight - 12, { align: "center" });

  doc.save(`Privora_Invoice_${order.orderNumber.toUpperCase()}.pdf`);
};
