'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/shared/theme-toggle';

const customerLinks = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customer/request', label: 'Ajukan Asuransi', icon: FileText },
  { href: '/customer/my-requests', label: 'Request Saya', icon: ClipboardList },
  { href: '/customer/profile', label: 'Profil', icon: User },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/requests', label: 'Daftar Request', icon: ClipboardList },
  { href: '/admin/occupation-types', label: 'Tipe Okupasi', icon: Settings },
  { href: '/admin/policies', label: 'Data Polis', icon: Shield },
  { href: '/admin/profile', label: 'Profil', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const links = user?.role === Role.ADMIN ? adminLinks : customerLinks;
  const currentPage = links.find((item) => pathname === item.href)?.label ?? 'Dashboard';
  const initials = (user?.name?.[0] || 'U').toUpperCase();

  const isSidebarExpanded = isDesktop ? isExpanded || isHovered : isMobileOpen;

  const mainContentMargin = useMemo(() => {
    if (!isDesktop) return 'ml-0';
    return isSidebarExpanded ? 'lg:ml-[304px]' : 'lg:ml-[112px]';
  }, [isDesktop, isSidebarExpanded]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = event.matches;
      setIsDesktop(matches);
      if (matches) {
        setIsMobileOpen(false);
      }
    };

    handleMediaChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleMediaChange(event);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleSidebarToggle = () => {
    if (isDesktop) {
      setIsExpanded((prev) => !prev);
      return;
    }
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      {!isDesktop && isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
          aria-label="Tutup sidebar"
        />
      )}

      <aside
        className={cn(
          'fixed top-2 bottom-2 left-4 z-50 flex h-[calc(100vh-1rem)] flex-col overflow-hidden rounded-3xl border border-blue-200/70 bg-white/90 shadow-xl shadow-blue-900/10 backdrop-blur-md transition-all duration-300 ease-in-out',
          'dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/25',
          isSidebarExpanded ? 'w-72' : 'w-20',
          isDesktop ? 'translate-x-0' : isMobileOpen ? 'translate-x-0' : '-translate-x-[115%]'
        )}
        onMouseEnter={() => {
          if (isDesktop && !isExpanded) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (isDesktop) {
            setIsHovered(false);
          }
        }}
      >
        <div className={cn('flex h-20 items-center', isSidebarExpanded ? 'px-6' : 'justify-center px-2')}>
          <Image
            src="/bsp_logo.png"
            alt="BSP Insurance Broker"
            width={isSidebarExpanded ? 88 : 44}
            height={isSidebarExpanded ? 28 : 44}
            priority
            className="h-auto transition-all duration-300"
          />
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto p-3">
          <p
            className={cn(
              'mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700/70 transition-all duration-200',
              isSidebarExpanded ? 'px-3 opacity-100' : 'text-center opacity-70'
            )}
          >
            {isSidebarExpanded ? 'Menu' : '•••'}
          </p>

          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isSidebarExpanded ? 'justify-start gap-3' : 'justify-center',
                    isActive
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 shadow-sm dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-600 hover:bg-blue-50/80 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors duration-200',
                      isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-300'
                    )}
                  />

                  <span
                    className={cn(
                      'truncate transition-all duration-200',
                      isSidebarExpanded ? 'max-w-45 opacity-100' : 'max-w-0 opacity-0'
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator />

        <div className="p-3">
          {isSidebarExpanded ? (
            <>
              <div className="mb-3 rounded-xl border border-blue-100/80 bg-blue-50/40 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-blue-200 bg-white">
                    {user?.profilePhotoUrl ? (
                      <Image
                        src={user.profilePhotoUrl}
                        alt="Foto Profil"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="mx-auto flex border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={handleLogout}
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      <div className={cn('min-h-screen transition-all duration-300 ease-in-out', mainContentMargin)}>
        <header className="sticky top-0 z-30 px-4 pt-2 lg:px-6">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-2xl border border-blue-100/70 bg-white/85 px-4 shadow-lg shadow-blue-900/5 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/85 dark:shadow-black/20 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={handleSidebarToggle}
                aria-label="Toggle Sidebar"
              >
                {!isDesktop ? (
                  isMobileOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )
                ) : isExpanded ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-600/80">
                  BSP Insurance Broker
                </p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{currentPage}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="flex items-center gap-3 rounded-xl border border-blue-100/80 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-blue-200 bg-blue-50">
                  {user?.profilePhotoUrl ? (
                    <Image
                      src={user.profilePhotoUrl}
                      alt="Foto Profil"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {initials}
                    </div>
                  )}
                </div>
                <Separator orientation="vertical" className="hidden h-5 sm:block" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Portal Asuransi</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
