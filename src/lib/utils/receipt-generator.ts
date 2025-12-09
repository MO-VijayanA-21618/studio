import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface LoanReceiptData {
  loanNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  loanAmount: number;
  goldItems: Array<{
    name: string;
    weight: number;
    purity: string;
  }>;
  goldRate: number;
  totalWeight: number;
  estimatedValue: number;
  loanDate: Date;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export const generateLoanReceipt = (loanData: LoanReceiptData) => {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  
  // Page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = '#D4AF37'; // Gold color
  const textColor = '#000000';
  
  // Header
  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NALLANDAVAR PAWN BROKER AND FINANCE', pageWidth / 2, 10, { align: 'center' });
  
  pdf.setFontSize(10);
  if (loanData.companyAddress) {
    pdf.text(loanData.companyAddress, pageWidth / 2, 17, { align: 'center' });
  }
  
  const contactInfo = [];
  if (loanData.companyPhone) contactInfo.push(`Ph: ${loanData.companyPhone}`);
  if (loanData.companyEmail) contactInfo.push(`Email: ${loanData.companyEmail}`);
  contactInfo.push('Licence No: 03/2025-2026');
  pdf.text(contactInfo.join(' | '), pageWidth / 2, 23, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Gold Loan Receipt', pageWidth / 2, 29, { align: 'center' });
  
  // Reset text color
  pdf.setTextColor(textColor);
  
  // Receipt details box
  pdf.setDrawColor(primaryColor);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 45, pageWidth - 20, 25);
  
  // Receipt info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Receipt No:', 15, 55);
  pdf.setFont('helvetica', 'normal');
  pdf.text(loanData.loanNumber, 50, 55);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date:', pageWidth - 80, 55);
  pdf.setFont('helvetica', 'normal');
  pdf.text(format(loanData.loanDate, 'dd/MM/yyyy'), pageWidth - 50, 55);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Time:', pageWidth - 80, 65);
  pdf.setFont('helvetica', 'normal');
  pdf.text(format(loanData.loanDate, 'HH:mm'), pageWidth - 50, 65);
  
  // Customer details
  let yPos = 85;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('CUSTOMER DETAILS', 15, yPos);
  
  yPos += 10;
  pdf.setFontSize(11);
  
  // Left side - Name and Phone
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(loanData.customerName, 50, yPos);
  
  yPos += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phone:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(loanData.customerPhone, 50, yPos);
  
  // Right side - Address
  pdf.setFont('helvetica', 'bold');
  pdf.text('Address:', 150, yPos - 8);
  pdf.setFont('helvetica', 'normal');
  const addressLines = pdf.splitTextToSize(loanData.customerAddress, 120);
  pdf.text(addressLines, 190, yPos - 8);
  
  // Gold items table
  yPos += 20;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('GOLD ITEMS PLEDGED', 15, yPos);
  
  yPos += 10;
  // Table headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('S.No', 15, yPos);
  pdf.text('Item Description', 35, yPos);
  pdf.text('Weight (gms)', 120, yPos);
  pdf.text('Purity', 160, yPos);
  pdf.text('Rate/gm', 190, yPos);
  pdf.text('Value (₹)', 220, yPos);
  
  // Table line
  pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);
  
  yPos += 8;
  pdf.setFont('helvetica', 'normal');
  
  loanData.goldItems.forEach((item, index) => {
    const itemValue = item.weight * loanData.goldRate * (parseInt(item.purity) / 24);
    
    pdf.text((index + 1).toString(), 15, yPos);
    pdf.text(item.name, 35, yPos);
    pdf.text(item.weight.toString(), 120, yPos);
    pdf.text(`${item.purity}K`, 160, yPos);
    pdf.text(`₹${loanData.goldRate}`, 190, yPos);
    pdf.text(`₹${itemValue.toLocaleString()}`, 220, yPos);
    
    yPos += 6;
  });
  
  // Total line
  pdf.line(15, yPos, pageWidth - 15, yPos);
  yPos += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL WEIGHT:', 120, yPos);
  pdf.text(`${loanData.totalWeight} gms`, 160, yPos);
  pdf.text('TOTAL VALUE:', 190, yPos);
  pdf.text(`₹${loanData.estimatedValue.toLocaleString()}`, 220, yPos);
  
  // Loan amount section
  yPos += 15;
  pdf.setTextColor(textColor);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOAN AMOUNT SANCTIONED:', 15, yPos);
  pdf.text(`₹${loanData.loanAmount.toLocaleString()}`, pageWidth - 80, yPos);
  
  // Signature section
  yPos += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Customer Signature:', 15, yPos);
  
  // Signature box for customer
  pdf.setDrawColor(primaryColor);
  pdf.rect(15, yPos + 5, 80, 20);
  
  // Footer
  yPos = pageHeight - 25;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Authorized Signatory', pageWidth - 80, yPos);
  
  // Signature line
  pdf.line(pageWidth - 120, yPos + 5, pageWidth - 15, yPos + 5);
  
  return pdf;
};