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
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NALANDAVAR FINANCE', pageWidth / 2, 12, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Gold Loan Receipt', pageWidth / 2, 20, { align: 'center' });
  
  // Reset text color
  pdf.setTextColor(textColor);
  
  // Receipt details box
  pdf.setDrawColor(primaryColor);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 35, pageWidth - 20, 25);
  
  // Receipt info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Receipt No:', 15, 45);
  pdf.setFont('helvetica', 'normal');
  pdf.text(loanData.loanNumber, 50, 45);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date:', pageWidth - 80, 45);
  pdf.setFont('helvetica', 'normal');
  pdf.text(format(loanData.loanDate, 'dd/MM/yyyy'), pageWidth - 50, 45);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Time:', pageWidth - 80, 55);
  pdf.setFont('helvetica', 'normal');
  pdf.text(format(loanData.loanDate, 'HH:mm'), pageWidth - 50, 55);
  
  // Customer details
  let yPos = 75;
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
  
  // Terms and conditions
  yPos += 25;
  pdf.setTextColor(textColor);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TERMS & CONDITIONS:', 15, yPos);
  
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  const terms = [
    '1. Interest rate as per company policy will be applicable',
    '2. Pledged gold articles are insured against fire and theft',
    '3. This receipt must be produced at the time of repayment',
    '4. Company is not responsible for any damage to ornaments due to testing',
    '5. Loan can be renewed by paying interest amount'
  ];
  
  terms.forEach(term => {
    pdf.text(term, 15, yPos);
    yPos += 5;
  });
  
  // Footer
  yPos = pageHeight - 25;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Signature', 50, yPos);
  pdf.text('Authorized Signatory', pageWidth - 80, yPos);
  
  // Signature lines
  pdf.line(15, yPos + 5, 100, yPos + 5);
  pdf.line(pageWidth - 120, yPos + 5, pageWidth - 15, yPos + 5);
  
  return pdf;
};