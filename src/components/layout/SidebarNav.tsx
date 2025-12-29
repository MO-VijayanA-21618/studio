'use client';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  RefreshCw,
  Handshake,
  Landmark,
  ShieldCheck,
  Calculator,
  Users,
  Settings,
  TrendingUp,
} from 'lucide-react';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/use-permissions';
import Link from 'next/link';



export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();

  const allMenuItems = [
    { href: '/dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard, show: true },
    { href: '/loans/create', label: t.sidebar.createLoan, icon: PlusCircle, show: hasPermission('loans', 'create') },
    { href: '/loans', label: t.sidebar.allLoans, icon: List, show: hasPermission('loans', 'read') },
    { href: '/loans/topup', label: 'Top Up Loan', icon: TrendingUp, show: hasPermission('loans', 'create') },
    { href: '/renewals', label: t.sidebar.renewals, icon: RefreshCw, show: hasPermission('loans', 'update') },
    { href: '/repayments', label: t.sidebar.repayments, icon: Handshake, show: hasPermission('loans', 'update') },
    { href: '/auctions', label: t.sidebar.auctions, icon: Landmark, show: hasPermission('loans', 'update') },
    { href: '/closures', label: t.sidebar.closures, icon: ShieldCheck, show: hasPermission('loans', 'update') },
    { href: '/accounting', label: 'Accounting', icon: Calculator, show: hasPermission('accounting', 'read') },
    { href: '/users', label: 'Users', icon: Users, show: hasPermission('users', 'read') },
    { href: '/settings', label: 'Settings', icon: Settings, show: hasPermission('users', 'read') },
  ];

  const menuItems = allMenuItems.filter(item => item.show);

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                    asChild={false}
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right', hidden: state === 'expanded' }}
                >
                    <item.icon />
                    <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-muted-foreground p-2 group-data-[collapsible=icon]:hidden">
          © 2024 {t.login.companyName}
        </p>
      </SidebarFooter>
    </>
  );
}
