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
import Link from 'next/link';



export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { t } = useLanguage();

  const menuItems = [
    { href: '/dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
    { href: '/loans/create', label: t.sidebar.createLoan, icon: PlusCircle },
    { href: '/loans', label: t.sidebar.allLoans, icon: List },
    { href: '/renewals', label: t.sidebar.renewals, icon: RefreshCw },
    { href: '/repayments', label: t.sidebar.repayments, icon: Handshake },
    { href: '/auctions', label: t.sidebar.auctions, icon: Landmark },
    { href: '/closures', label: t.sidebar.closures, icon: ShieldCheck },
    { href: '/accounting', label: 'Accounting', icon: Calculator },
  ];

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
