'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loan } from '@/lib/types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, XCircle, Plus } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'disbursement' | 'repayment' | 'topup' | 'renewal' | 'closure';
  amount: number;
  date: Date;
  description: string;
  interestAmount?: number;
  principalAmount?: number;
}

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

export function LoanDetailsModal({ isOpen, onClose, loan }: LoanDetailsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && loan?.id) {
      fetchTransactions();
    }
  }, [isOpen, loan?.id]);
  
  if (!loan) return null;

  const fetchTransactions = async () => {
    if (!loan?.id) return;
    
    setLoading(true);
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('loanId', '==', loan.id)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      const txns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      })) as Transaction[];
      
      // Add initial disbursement if not present
      const hasDisbursement = txns.some(t => t.type === 'disbursement');
      if (!hasDisbursement) {
        txns.push({
          id: 'initial',
          type: 'disbursement',
          amount: loan.loanAmount - (loan.topUpAmount || 0), // Use original loan amount minus top-ups
          date: loan.loanDate,
          description: 'Initial loan disbursement'
        });
      }
      
      setTransactions(txns.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Auctioned': return 'bg-red-100 text-red-800';
      case 'Renewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'disbursement': return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
      case 'topup': return <Plus className="h-4 w-4 text-blue-600" />;
      case 'repayment': return <ArrowUpCircle className="h-4 w-4 text-orange-600" />;
      case 'renewal': return <RefreshCw className="h-4 w-4 text-purple-600" />;
      case 'closure': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <ArrowDownCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'disbursement': return 'text-green-600';
      case 'topup': return 'text-blue-600';
      case 'repayment': return 'text-orange-600';
      case 'renewal': return 'text-purple-600';
      case 'closure': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const totalDisbursed = transactions
    .filter(t => t.type === 'disbursement' || t.type === 'topup')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalRepaid = transactions
    .filter(t => t.type === 'repayment')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const outstandingAmount = totalDisbursed - totalRepaid;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Loan Journey - {loan.customerName}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="items">Pledged Items</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Disbursed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">₹{totalDisbursed.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Repaid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">₹{totalRepaid.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Outstanding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">₹{outstandingAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Loan ID:</span>
                    <span className="font-mono text-sm">{loan.loanId || loan.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(loan.status)}>{loan.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Gold Rate:</span>
                    <span>₹{loan.goldRate}/gram</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Weight:</span>
                    <span>{loan.totalWeight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Value:</span>
                    <span>₹{loan.estimatedValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Date:</span>
                    <span>{loan.loanDate.toLocaleDateString('en-GB')}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{loan.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer ID:</span>
                    <span className="font-mono text-sm">{loan.customerId}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <p>No transactions found.</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium capitalize">{transaction.type}</p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{transaction.date.toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'repayment' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                          </p>
                          {transaction.interestAmount && (
                            <p className="text-xs text-muted-foreground">Interest: ₹{transaction.interestAmount.toLocaleString()}</p>
                          )}
                          {transaction.principalAmount && (
                            <p className="text-xs text-muted-foreground">Principal: ₹{transaction.principalAmount.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Items Pledged ({loan.loanItems?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {loan.loanItems && loan.loanItems.length > 0 ? (
                  <div className="space-y-3">
                    {loan.loanItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.photo && (
                            <img 
                              src={item.photo} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.weight}g • {item.purity}K Gold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{((item.weight * loan.goldRate * (parseInt(item.purity) / 24))).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Est. Value</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loan.customerPhoto && (
                    <div>
                      <h4 className="font-medium mb-2">Customer Photo</h4>
                      <img 
                        src={loan.customerPhoto} 
                        alt="Customer"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  {loan.loanItems?.some(item => item.photo) && (
                    <div>
                      <h4 className="font-medium mb-2">Item Photos</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {loan.loanItems
                          .filter(item => item.photo)
                          .map((item, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={item.photo!} 
                                alt={item.name}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <p className="text-xs mt-1 text-center truncate">{item.name}</p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {!loan.customerPhoto && !loan.loanItems?.some(item => item.photo) && (
                    <p className="text-muted-foreground">No documents or photos available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}