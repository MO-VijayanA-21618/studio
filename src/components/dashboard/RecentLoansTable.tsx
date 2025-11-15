import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ta } from '@/lib/constants/ta';

const mockLoans = [
  { id: 'LN7501', customer: 'குமார்', amount: 50000, date: '2024-05-20', status: 'Active' },
  { id: 'LN7502', customer: 'சரவணன்', amount: 75000, date: '2024-05-18', status: 'Active' },
  { id: 'LN7499', customer: 'பிரியா', amount: 25000, date: '2024-05-15', status: 'Closed' },
  { id: 'LN7495', customer: 'ராஜேஷ்', amount: 120000, date: '2024-04-30', status: 'Auctioned' },
  { id: 'LN7500', customer: 'மீனா', amount: 8000, date: '2024-05-17', status: 'Active' },
];

export function RecentLoansTable() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Closed': return 'secondary';
      case 'Auctioned': return 'destructive';
      default: return 'outline';
    }
  };

  const statusTranslations: { [key: string]: string } = {
    Active: ta.common.active,
    Closed: ta.common.closed,
    Auctioned: ta.common.auctioned
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{ta.dashboard.loanId}</TableHead>
          <TableHead>{ta.dashboard.customerName}</TableHead>
          <TableHead className="text-right">{ta.dashboard.amount}</TableHead>
          <TableHead>{ta.dashboard.date}</TableHead>
          <TableHead>{ta.dashboard.status}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockLoans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell className="font-medium">{loan.id}</TableCell>
            <TableCell>{loan.customer}</TableCell>
            <TableCell className="text-right">₹{loan.amount.toLocaleString('en-IN')}</TableCell>
            <TableCell>{loan.date}</TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(loan.status)}>
                    {statusTranslations[loan.status] || loan.status}
                </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
