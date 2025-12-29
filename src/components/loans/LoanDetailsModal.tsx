'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loan } from '@/lib/types';

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

export function LoanDetailsModal({ isOpen, onClose, loan }: LoanDetailsModalProps) {
  if (!loan) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Auctioned': return 'bg-red-100 text-red-800';
      case 'Renewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Loan Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Loan Summary */}
          <div>
            <h3 className="font-semibold mb-2">Loan Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Loan ID: <span className="font-mono">{loan.loanId || loan.id}</span></div>
              <div>Status: <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge></div>
              <div>Loan Amount: <span className="font-medium">₹{loan.loanAmount.toLocaleString()}</span></div>
              <div>Gold Rate: <span className="font-medium">₹{loan.goldRate}/gram</span></div>
              <div>Total Weight: <span className="font-medium">{loan.totalWeight}g</span></div>
              <div>Estimated Value: <span className="font-medium">₹{loan.estimatedValue.toLocaleString()}</span></div>
              <div>Loan Date: <span className="font-medium">{loan.loanDate.toLocaleDateString()}</span></div>
            </div>
          </div>
          
          <Separator />
          
          {/* Customer Details */}
          <div>
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Name: {loan.customerName}</div>
              <div>Customer ID: <span className="font-mono">{loan.customerId}</span></div>
            </div>
          </div>
          
          <Separator />
          
          {/* Items Pledged */}
          <div>
            <h3 className="font-semibold mb-2">Items Pledged ({loan.loanItems?.length || 0})</h3>
            {loan.loanItems && loan.loanItems.length > 0 ? (
              <div className="space-y-2">
                {loan.loanItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.weight}g • {item.purity}K Gold
                      </div>
                    </div>
                    {item.photo && (
                      <img 
                        src={item.photo} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No items recorded</p>
            )}
          </div>
          
          {/* Customer Photo */}
          {loan.customerPhoto && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Customer Photo</h3>
                <img 
                  src={loan.customerPhoto} 
                  alt="Customer"
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </div>
            </>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}