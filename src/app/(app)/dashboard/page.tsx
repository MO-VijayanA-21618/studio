'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentLoansTable } from '@/components/dashboard/RecentLoansTable';
import { AccountingSummary } from '@/components/dashboard/AccountingSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { IndianRupee, Landmark, PlusCircle, RefreshCw } from 'lucide-react';
import { getDashboardStats } from '@/lib/firebase/dashboard-stats';
import Link from 'next/link';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalLoans: 0,
    renewalsPending: 0,
    auctionAlerts: 0,
    recentLoans: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
      </div>

      <AccountingSummary />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title={t.dashboard.totalLoans} 
          value={loading ? '...' : stats.totalLoans.toString()} 
          icon={<IndianRupee />} 
        />
        <StatCard 
          title={t.dashboard.renewalsPending} 
          value={loading ? '...' : stats.renewalsPending.toString()} 
          icon={<RefreshCw />} 
        />
        <StatCard 
          title={t.dashboard.auctionAlerts} 
          value={loading ? '...' : stats.auctionAlerts.toString()} 
          icon={<Landmark />} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t.dashboard.recentLoans}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentLoansTable />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Link href="/loans/create" passHref>
                        <Button className="w-full justify-start" size="lg">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t.dashboard.createLoan}
                        </Button>
                    </Link>
                    <Link href="/loans" passHref>
                        <Button variant="secondary" className="w-full justify-start" size="lg">
                            <IndianRupee className="mr-2 h-4 w-4" />
                            {t.dashboard.viewAllLoans}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
