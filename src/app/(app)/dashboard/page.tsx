import { StatCard } from '@/components/dashboard/StatCard';
import { RecentLoansTable } from '@/components/dashboard/RecentLoansTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ta } from '@/lib/constants/ta';
import { IndianRupee, Landmark, PlusCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">{ta.dashboard.title}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title={ta.dashboard.totalLoans} value="1,250" icon={<IndianRupee />} />
        <StatCard title={ta.dashboard.renewalsPending} value="82" icon={<RefreshCw />} />
        <StatCard title={ta.dashboard.auctionAlerts} value="15" icon={<Landmark />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{ta.dashboard.recentLoans}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentLoansTable />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>{ta.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Link href="/loans/create" passHref>
                        <Button className="w-full justify-start" size="lg">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {ta.dashboard.createLoan}
                        </Button>
                    </Link>
                    <Link href="/loans" passHref>
                        <Button variant="secondary" className="w-full justify-start" size="lg">
                            <IndianRupee className="mr-2 h-4 w-4" />
                            {ta.dashboard.viewAllLoans}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
