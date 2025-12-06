'use client';

export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamically import components to prevent SSR issues
const TrialBalance = dynamicImport(() => import('@/components/accounting/TrialBalance').then(mod => ({ default: mod.TrialBalance })), { ssr: false });
const VoucherEntries = dynamicImport(() => import('@/components/accounting/VoucherEntries').then(mod => ({ default: mod.VoucherEntries })), { ssr: false });
const DayBook = dynamicImport(() => import('@/components/accounting/DayBook').then(mod => ({ default: mod.DayBook })), { ssr: false });
const AccountingSetup = dynamicImport(() => import('@/components/setup/AccountingSetup').then(mod => ({ default: mod.AccountingSetup })), { ssr: false });
const ManualJournalEntry = dynamicImport(() => import('@/components/accounting/ManualJournalEntry').then(mod => ({ default: mod.ManualJournalEntry })), { ssr: false });
const QuickEntryTemplates = dynamicImport(() => import('@/components/accounting/QuickEntryTemplates').then(mod => ({ default: mod.QuickEntryTemplates })), { ssr: false });
const LedgerView = dynamicImport(() => import('@/components/accounting/LedgerView').then(mod => ({ default: mod.LedgerView })), { ssr: false });

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