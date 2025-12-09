'use client';
import {
  CircleUser,
  LogOut,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from '../ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Logo } from '../icons/Logo';
import { LanguageSwitch } from '../ui/language-switch';

export function Header() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { t } = useLanguage();

  const handleLogout = () => {
    // In a real app, call Firebase signOut
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      {isMobile ? (
        <SidebarTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
            </Button>
        </SidebarTrigger>
      ) : <div className="w-8"></div> }

      <div className="w-full flex-1">
        {!isMobile && <Logo className="hidden md:block h-10 w-auto" />}
      </div>
      <LanguageSwitch />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t.common.logout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
