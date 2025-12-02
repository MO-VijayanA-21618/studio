'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrialBalance } from '@/components/accounting/TrialBalance';
import { VoucherEntries } from '@/components/accounting/VoucherEntries';
import { DayBook } from '@/components/accounting/DayBook';
import { AccountingSetup } from '@/components/setup/AccountingSetup';
import { ManualJournalEntry } from '@/components/accounting/ManualJournalEntry';
import { QuickEntryTemplates } from '@/components/accounting/QuickEntryTemplates';
import { LedgerView } from '@/components/accounting/LedgerView';

export default function AccountingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounting</h1>
        <p className="text-muted-foreground">Manage vouchers, trial balance, and reconciliation</p>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="daybook">Day Book</TabsTrigger>
          <TabsTrigger value="vouchers">Voucher Entries</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup">
          <AccountingSetup />
        </TabsContent>
        
        <TabsContent value="manual">
          <div className="space-y-6">
            <QuickEntryTemplates />
            <ManualJournalEntry />
          </div>
        </TabsContent>
        
        <TabsContent value="ledger">
          <LedgerView />
        </TabsContent>
        
        <TabsContent value="daybook">
          <DayBook />
        </TabsContent>
        
        <TabsContent value="vouchers">
          <VoucherEntries />
        </TabsContent>
        
        <TabsContent value="trial">
          <TrialBalance />
        </TabsContent>
      </Tabs>
    </div>
  );
}