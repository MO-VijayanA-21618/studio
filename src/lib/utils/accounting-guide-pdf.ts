import jsPDF from 'jspdf';

export const generateAccountingGuidePDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > 280) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = pdf.splitTextToSize(text, contentWidth);
    checkPageBreak(lines.length * (fontSize / 2));
    pdf.text(lines, margin, yPos);
    yPos += lines.length * (fontSize / 2) + 3;
  };

  // Title
  pdf.setFillColor(212, 175, 55);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Accounting Guide', pageWidth / 2, 15, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text('Gold Loan Business - Double Entry Bookkeeping', pageWidth / 2, 23, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  yPos = 40;

  // Part 1: Basic Concepts
  addText('PART 1: BASIC CONCEPTS', 16, true);
  addText('Double Entry System', 14, true);
  addText('Golden Rule: Every transaction has TWO sides. Money always comes FROM somewhere and goes TO somewhere.');
  yPos += 5;

  // Part 2: Account Types
  checkPageBreak(40);
  addText('PART 2: ACCOUNT TYPES', 16, true);
  
  addText('1. Assets - What You Own', 12, true);
  addText('• Cash in Hand (Code: 1001) - Physical cash in your cash box');
  addText('• Loans Receivable (Code: 1201) - Money customers owe you');
  yPos += 3;

  addText('2. Capital/Equity - Owner\'s Investment', 12, true);
  addText('• Capital (Code: 3001) - Owner\'s investment in business');
  yPos += 3;

  addText('3. Income - What You Earn', 12, true);
  addText('• Interest Income (Code: 4001) - Interest earned on loans');
  yPos += 3;

  addText('4. Expenses - What You Spend', 12, true);
  addText('• Rent Expense (Code: 5001) - Office rent payments');
  yPos += 5;

  // Part 3: Debit & Credit Rules
  checkPageBreak(50);
  addText('PART 3: DEBIT & CREDIT RULES', 16, true);
  addText('Debit = Where money WENT / Asset increase');
  addText('Credit = Where money CAME FROM / Asset decrease');
  yPos += 3;

  // Table
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  const tableY = yPos;
  pdf.rect(margin, tableY, contentWidth, 30);
  pdf.line(margin, tableY + 10, margin + contentWidth, tableY + 10);
  pdf.line(margin + 60, tableY, margin + 60, tableY + 30);
  pdf.line(margin + 120, tableY, margin + 120, tableY + 30);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Type', margin + 5, tableY + 7);
  pdf.text('To Increase', margin + 65, tableY + 7);
  pdf.text('To Decrease', margin + 125, tableY + 7);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Assets', margin + 5, tableY + 17);
  pdf.text('Debit', margin + 65, tableY + 17);
  pdf.text('Credit', margin + 125, tableY + 17);
  
  pdf.text('Capital', margin + 5, tableY + 24);
  pdf.text('Credit', margin + 65, tableY + 24);
  pdf.text('Debit', margin + 125, tableY + 24);
  
  yPos = tableY + 35;

  // Part 4: Practical Examples
  pdf.addPage();
  yPos = 20;
  addText('PART 4: PRACTICAL EXAMPLES', 16, true);
  
  // Day 1
  addText('Day 1: Starting the Business', 14, true);
  addText('Event: Owner brings ₹10,00,000 cash to start business');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Cash in Hand    ₹10,00,000', margin + 5, yPos + 13);
  pdf.text('Credit: Capital         ₹10,00,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash in Hand = ₹10,00,000, Capital = ₹10,00,000');
  yPos += 5;

  // Day 2
  checkPageBreak(35);
  addText('Day 2: First Loan Disbursement', 14, true);
  addText('Event: You give ₹50,000 loan to Ravi');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Loans Receivable  ₹50,000', margin + 5, yPos + 13);
  pdf.text('Credit: Cash in Hand      ₹50,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash in Hand = ₹9,50,000, Loans Receivable = ₹50,000');
  yPos += 5;

  // Day 3
  checkPageBreak(35);
  addText('Day 3: Second Loan', 14, true);
  addText('Event: You give ₹1,00,000 loan to Priya');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Loans Receivable  ₹1,00,000', margin + 5, yPos + 13);
  pdf.text('Credit: Cash in Hand      ₹1,00,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash in Hand = ₹8,50,000, Loans Receivable = ₹1,50,000');
  yPos += 5;

  // Day 4
  checkPageBreak(40);
  addText('Day 4: Loan Repayment with Interest', 14, true);
  addText('Event: Ravi repays ₹50,000 principal + ₹2,000 interest');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 25, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Cash in Hand        ₹52,000', margin + 5, yPos + 13);
  pdf.text('Credit: Loans Receivable    ₹50,000', margin + 5, yPos + 18);
  pdf.text('Credit: Interest Income     ₹2,000', margin + 5, yPos + 23);
  yPos += 30;
  
  addText('Result: Cash = ₹9,02,000, Loans = ₹1,00,000, Interest Income = ₹2,000');
  yPos += 5;

  // Day 5
  checkPageBreak(35);
  addText('Day 5: Paying Office Rent', 14, true);
  addText('Event: You pay ₹10,000 rent');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Rent Expense    ₹10,000', margin + 5, yPos + 13);
  pdf.text('Credit: Cash in Hand    ₹10,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash = ₹8,92,000, Rent Expense = ₹10,000');
  yPos += 5;

  // Day 6
  checkPageBreak(35);
  addText('Day 6: Third Loan', 14, true);
  addText('Event: You give ₹75,000 loan to Suresh');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Loans Receivable  ₹75,000', margin + 5, yPos + 13);
  pdf.text('Credit: Cash in Hand      ₹75,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash = ₹8,17,000, Loans Receivable = ₹1,75,000');
  yPos += 5;

  // Day 7
  checkPageBreak(35);
  addText('Day 7: Interest-Only Payment', 14, true);
  addText('Event: Priya pays ₹5,000 interest only (loan continues)');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Cash in Hand      ₹5,000', margin + 5, yPos + 13);
  pdf.text('Credit: Interest Income   ₹5,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash = ₹8,22,000, Interest Income = ₹7,000');
  addText('Note: Loans Receivable unchanged - principal still owed');
  yPos += 5;

  // Day 8
  checkPageBreak(35);
  addText('Day 8: Owner Withdrawal', 14, true);
  addText('Event: Owner withdraws ₹50,000 for personal use');
  yPos += 2;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos, contentWidth, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.text('Journal Entry:', margin + 5, yPos + 7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Debit:  Drawings/Capital  ₹50,000', margin + 5, yPos + 13);
  pdf.text('Credit: Cash in Hand      ₹50,000', margin + 5, yPos + 18);
  yPos += 25;
  
  addText('Result: Cash = ₹7,72,000, Capital = ₹9,50,000');
  yPos += 10;

  // Final Summary
  pdf.addPage();
  yPos = 20;
  addText('FINAL SUMMARY AFTER 8 DAYS', 16, true);
  yPos += 5;
  
  pdf.setFillColor(220, 240, 220);
  pdf.rect(margin, yPos, contentWidth, 50, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('ASSETS', margin + 5, yPos + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Cash in Hand:', margin + 5, yPos + 15);
  pdf.text('₹7,72,000', margin + 100, yPos + 15);
  pdf.text('Loans Receivable:', margin + 5, yPos + 22);
  pdf.text('₹1,75,000', margin + 100, yPos + 22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Assets:', margin + 5, yPos + 29);
  pdf.text('₹9,47,000', margin + 100, yPos + 29);
  
  pdf.text('INCOME & EXPENSES', margin + 5, yPos + 38);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Interest Income: ₹7,000  |  Rent Expense: ₹10,000', margin + 5, yPos + 45);
  yPos += 55;

  // Quick Reference
  addText('QUICK REFERENCE TABLE', 16, true);
  yPos += 3;
  
  const transactions = [
    ['Owner brings cash', 'Cash in Hand', 'Capital'],
    ['Give loan', 'Loans Receivable', 'Cash in Hand'],
    ['Receive principal + interest', 'Cash in Hand', 'Loans Receivable + Interest Income'],
    ['Receive interest only', 'Cash in Hand', 'Interest Income'],
    ['Pay rent', 'Rent Expense', 'Cash in Hand'],
    ['Owner withdraws', 'Drawings', 'Cash in Hand'],
  ];

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Transaction', margin + 5, yPos);
  pdf.text('Debit', margin + 70, yPos);
  pdf.text('Credit', margin + 120, yPos);
  yPos += 5;
  
  pdf.setFont('helvetica', 'normal');
  transactions.forEach(([trans, debit, credit]) => {
    checkPageBreak(8);
    pdf.text(trans, margin + 5, yPos);
    pdf.text(debit, margin + 70, yPos);
    pdf.text(credit, margin + 120, yPos);
    yPos += 6;
  });

  // Key Points
  yPos += 10;
  checkPageBreak(50);
  addText('KEY POINTS TO REMEMBER', 16, true);
  addText('1. Every transaction has TWO sides - Debit and Credit must always be equal');
  addText('2. Cash in Hand = Physical cash available (changes daily)');
  addText('3. Capital = Owner\'s investment (changes only when owner adds/withdraws)');
  addText('4. Loans Receivable = Money customers owe you');
  addText('5. Interest Income = Your profit from loans');
  addText('6. Always record transactions immediately');
  addText('7. Review accounts regularly');

  // Footer on last page
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by Gold Loan Management System', pageWidth / 2, 285, { align: 'center' });

  return pdf;
};
