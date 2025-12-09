'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Download } from 'lucide-react';
import { generateAccountingGuidePDF } from '@/lib/utils/accounting-guide-pdf';

interface Settings {
  defaultGoldRate: number;
  minGoldRate: number;
  roi: number;
  minTenure: number;
  carryForwardInt: number;
  auctionBufferDays: number;
  maxAging: number;
  ltvRatio: number;
  latePaymentPenalty: number;
  gracePeriod: number;
  companyName: string;
  licenseNumber: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  interestCalculation: string;
  interestFrequency: string;
  renewalReminderDays: number;
  auctionNoticeDays: number;
  receiptPrefix: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    defaultGoldRate: 0,
    minGoldRate: 0,
    roi: 0,
    minTenure: 0,
    carryForwardInt: 0,
    auctionBufferDays: 0,
    maxAging: 0,
    ltvRatio: 75,
    latePaymentPenalty: 0,
    gracePeriod: 0,
    companyName: '',
    licenseNumber: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    interestCalculation: 'Simple',
    interestFrequency: 'Monthly',
    renewalReminderDays: 0,
    auctionNoticeDays: 0,
    receiptPrefix: 'LN',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as Settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      toast({
        title: 'Settings Saved',
        description: 'Configuration updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadGuide = () => {
    try {
      const pdf = generateAccountingGuidePDF();
      pdf.save('Accounting_Guide.pdf');
      toast({
        title: 'Guide Downloaded',
        description: 'Accounting guide PDF has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <Button onClick={handleDownloadGuide} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Accounting Guide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="font-semibold text-lg">Loan Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="defaultGoldRate">Default Gold Rate (₹/gram)</Label>
              <Input
                id="defaultGoldRate"
                type="number"
                value={settings.defaultGoldRate}
                onChange={(e) => setSettings({ ...settings, defaultGoldRate: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="minGoldRate">Min Gold Rate (₹/gram)</Label>
              <Input
                id="minGoldRate"
                type="number"
                value={settings.minGoldRate}
                onChange={(e) => setSettings({ ...settings, minGoldRate: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="roi">ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                value={settings.roi}
                onChange={(e) => setSettings({ ...settings, roi: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="minTenure">Min Tenure (months)</Label>
              <Input
                id="minTenure"
                type="number"
                value={settings.minTenure}
                onChange={(e) => setSettings({ ...settings, minTenure: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="carryForwardInt">Carry Forward Interest (%)</Label>
              <Input
                id="carryForwardInt"
                type="number"
                value={settings.carryForwardInt}
                onChange={(e) => setSettings({ ...settings, carryForwardInt: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="auctionBufferDays">Auction Buffer Days</Label>
              <Input
                id="auctionBufferDays"
                type="number"
                value={settings.auctionBufferDays}
                onChange={(e) => setSettings({ ...settings, auctionBufferDays: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="maxAging">Max Aging (days)</Label>
              <Input
                id="maxAging"
                type="number"
                value={settings.maxAging}
                onChange={(e) => setSettings({ ...settings, maxAging: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="ltvRatio">LTV Ratio (%)</Label>
              <Input
                id="ltvRatio"
                type="number"
                value={settings.ltvRatio}
                onChange={(e) => setSettings({ ...settings, ltvRatio: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="latePaymentPenalty">Late Payment Penalty (%)</Label>
              <Input
                id="latePaymentPenalty"
                type="number"
                value={settings.latePaymentPenalty}
                onChange={(e) => setSettings({ ...settings, latePaymentPenalty: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="gracePeriod">Grace Period (days)</Label>
              <Input
                id="gracePeriod"
                type="number"
                value={settings.gracePeriod}
                onChange={(e) => setSettings({ ...settings, gracePeriod: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="renewalReminderDays">Renewal Reminder (days before)</Label>
              <Input
                id="renewalReminderDays"
                type="number"
                value={settings.renewalReminderDays}
                onChange={(e) => setSettings({ ...settings, renewalReminderDays: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="auctionNoticeDays">Auction Notice (days before)</Label>
              <Input
                id="auctionNoticeDays"
                type="number"
                value={settings.auctionNoticeDays}
                onChange={(e) => setSettings({ ...settings, auctionNoticeDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <h3 className="font-semibold text-lg mt-8">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                type="text"
                value={settings.licenseNumber}
                onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input
                id="companyAddress"
                type="text"
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                type="text"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              />
            </div>
          </div>

          <h3 className="font-semibold text-lg mt-8">Calculation & Document Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="interestCalculation">Interest Calculation</Label>
              <Input
                id="interestCalculation"
                type="text"
                value={settings.interestCalculation}
                onChange={(e) => setSettings({ ...settings, interestCalculation: e.target.value })}
                placeholder="Simple/Compound"
              />
            </div>

            <div>
              <Label htmlFor="interestFrequency">Interest Frequency</Label>
              <Input
                id="interestFrequency"
                type="text"
                value={settings.interestFrequency}
                onChange={(e) => setSettings({ ...settings, interestFrequency: e.target.value })}
                placeholder="Daily/Monthly/Yearly"
              />
            </div>

            <div>
              <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
              <Input
                id="receiptPrefix"
                type="text"
                value={settings.receiptPrefix}
                onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
