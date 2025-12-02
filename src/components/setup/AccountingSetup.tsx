'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { setupChartOfAccounts } from '@/lib/firebase/setup-accounting';
import { resetAccountingSystem } from '@/lib/firebase/reset-accounting';
import { useToast } from '@/hooks/use-toast';

export function AccountingSetup() {
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [initialCapital, setInitialCapital] = useState(100000);
  const { toast } = useToast();

  const handleSetup = async () => {
    if (initialCapital < 0) {
      toast({
        title: "Invalid Amount",
        description: "Initial capital cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await setupChartOfAccounts(initialCapital);
      setIsSetup(true);
      toast({
        title: "Setup Complete",
        description: `Chart of accounts initialized with ₹${initialCapital.toLocaleString()} capital`,
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to initialize chart of accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetAccountingSystem();
      setIsSetup(false);
      toast({
        title: "System Reset",
        description: "All accounting data has been cleared. You can now reinitialize.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset accounting system",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounting System Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Initialize the chart of accounts and accounting system for your gold loan business.
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="capital">Initial Capital Amount</Label>
              <Input
                id="capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                placeholder="Enter starting capital"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Chart of Accounts to be created:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• 1001 - Cash in Hand (₹{initialCapital.toLocaleString()})</li>
                <li>• 1201 - Loans Receivable (₹0)</li>
                <li>• 1301 - Suspense Account (₹0)</li>
                <li>• 3001 - Owner Capital (₹{initialCapital.toLocaleString()})</li>
                <li>• 4001 - Interest Income (₹0)</li>
                <li>• 5001 - Bad Debt Writeoff (₹0)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleSetup} 
              disabled={loading || isSetup}
              className="w-full"
            >
              {loading ? 'Setting up...' : isSetup ? 'Setup Complete' : 'Initialize Accounting System'}
            </Button>
            
            <Button 
              onClick={handleReset} 
              disabled={resetting}
              variant="destructive"
              className="w-full"
            >
              {resetting ? 'Resetting...' : 'Reset & Clear All Data'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}