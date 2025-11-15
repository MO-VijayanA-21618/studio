import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface ReceiptData {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  loanItems: Array<{
    name: string;
    weight: number;
    purity: string;
    photo?: string | null;
  }>;
  goldRate: number;
  loanAmount: number;
  totalWeight: number;
  estimatedValue: number;
  interestRate: number;
  customerPhoto?: string | null;
  emiSchedule: Array<{
    month: number;
    date: string;
    principal: number;
    interest: number;
    total: number;
  }>;
}

export const generateReceiptPDF = async (data: ReceiptData) => {
  const doc = new jsPDF();
  
  // Generate unique receipt ID
  const receiptId = `LN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  // Generate QR code
  const qrCodeData = `Receipt ID: ${receiptId}\nCustomer: ${data.customer.name}\nAmount: ₹${data.loanAmount}`;
  const qrCodeDataURL = await QRCode.toDataURL(qrCodeData);
  
  // Header
  doc.setFontSize(20);
  doc.text('GOLD LOAN RECEIPT', 105, 20, { align: 'center' });
  
  // Receipt ID
  doc.setFontSize(12);
  doc.text(`Receipt ID: ${receiptId}`, 20, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 35);
  
  // QR Code and Customer Photo
  doc.addImage(qrCodeDataURL, 'PNG', 160, 45, 30, 30);
  
  // Customer Photo (if available)
  if (data.customerPhoto) {
    doc.addImage(data.customerPhoto, 'JPEG', 160, 80, 30, 30);
  }
  
  // Customer Details
  doc.setFontSize(14);
  doc.text('Customer Details:', 20, 50);
  doc.setFontSize(10);
  doc.text(`Name: ${data.customer.name}`, 20, 60);
  doc.text(`Phone: ${data.customer.phone}`, 20, 67);
  doc.text(`Address: ${data.customer.address}`, 20, 74);
  
  // Loan Details
  doc.setFontSize(14);
  doc.text('Loan Details:', 20, 90);
  doc.setFontSize(10);
  doc.text(`Loan Amount: ₹${data.loanAmount.toLocaleString()}`, 20, 100);
  doc.text(`Gold Rate: ₹${data.goldRate}/gram`, 20, 107);
  doc.text(`Total Weight: ${data.totalWeight}g`, 20, 114);
  doc.text(`Estimated Value: ₹${data.estimatedValue.toLocaleString()}`, 20, 121);
  doc.text(`Interest Rate: ${data.interestRate}% per annum`, 20, 128);
  
  // Items Pledged
  doc.setFontSize(14);
  doc.text('Items Pledged:', 20, 145);
  doc.setFontSize(10);
  let yPos = 155;
  data.loanItems.forEach((item, index) => {
    doc.text(`${index + 1}. ${item.name} - ${item.weight}g (${item.purity}K)`, 20, yPos);
    yPos += 7;
  });
  
  // EMI Schedule
  yPos += 10;
  doc.setFontSize(14);
  doc.text('EMI Schedule:', 20, yPos);
  yPos += 10;
  doc.setFontSize(8);
  
  // Table headers
  doc.text('EMI No.', 20, yPos);
  doc.text('Due Date', 50, yPos);
  doc.text('Principal', 90, yPos);
  doc.text('Interest', 130, yPos);
  doc.text('Total EMI', 170, yPos);
  yPos += 5;
  
  // Table line
  doc.line(20, yPos, 190, yPos);
  yPos += 5;
  
  data.emiSchedule.forEach((emi) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(emi.month.toString(), 20, yPos);
    doc.text(emi.date, 50, yPos);
    doc.text(`₹${emi.principal?.toFixed(0) || '0'}`, 90, yPos);
    doc.text(`₹${emi.interest?.toFixed(0) || '0'}`, 130, yPos);
    doc.text(`₹${emi.total.toFixed(0)}`, 170, yPos);
    yPos += 7;
  });
  
  // Add second page for item photos if available
  const itemsWithPhotos = data.loanItems.filter(item => item.photo);
  if (itemsWithPhotos.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.text('Item Photos', 105, yPos, { align: 'center' });
    yPos += 20;
    
    let photosPerRow = 2;
    let photoWidth = 80;
    let photoHeight = 60;
    let xStart = 20;
    let currentX = xStart;
    let currentY = yPos;
    
    itemsWithPhotos.forEach((item, index) => {
      if (item.photo) {
        // Add item photo
        doc.addImage(item.photo, 'JPEG', currentX, currentY, photoWidth, photoHeight);
        
        // Add item name below photo
        doc.setFontSize(10);
        doc.text(item.name, currentX + photoWidth/2, currentY + photoHeight + 10, { align: 'center' });
        doc.text(`${item.weight}g (${item.purity}K)`, currentX + photoWidth/2, currentY + photoHeight + 17, { align: 'center' });
        
        // Move to next position
        currentX += photoWidth + 10;
        if ((index + 1) % photosPerRow === 0) {
          currentX = xStart;
          currentY += photoHeight + 30;
        }
        
        // Check if we need a new page
        if (currentY > 200) {
          doc.addPage();
          currentY = 20;
          currentX = xStart;
        }
      }
    });
  }
  
  // Footer on last page
  yPos = doc.internal.pageSize.height - 30;
  doc.setFontSize(8);
  doc.text('This is a computer generated receipt.', 105, yPos, { align: 'center' });
  doc.text(`Receipt ID: ${receiptId}`, 105, yPos + 7, { align: 'center' });
  
  // Save PDF
  doc.save(`loan-receipt-${receiptId}.pdf`);
  
  return receiptId;
};