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
import { ta } from '@/lib/constants/ta';
import Link from 'next/link';

const menuItems = [
  { href: '/dashboard', label: ta.sidebar.dashboard, icon: LayoutDashboard },
  { href: '/loans/create', label: ta.sidebar.createLoan, icon: PlusCircle },
  { href: '/loans', label: ta.sidebar.allLoans, icon: List },
  { href: '/renewals', label: ta.sidebar.renewals, icon: RefreshCw },
  { href: '/repayments', label: ta.sidebar.repayments, icon: Handshake },
  { href: '/auctions', label: ta.sidebar.auctions, icon: Landmark },
  { href: '/closures', label: ta.sidebar.closures, icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();

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
          © 2024 Nalandavar
        </p>
      </SidebarFooter>
    </>
  );
}
