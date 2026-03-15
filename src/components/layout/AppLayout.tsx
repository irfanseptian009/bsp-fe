'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  Settings,
  LogOut,
  Shield,
  Flame,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const links = user?.role === Role.ADMIN ? adminLinks : customerLinks;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              FIMS
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Fire Insurance
            </p>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-orange-500' : ''}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* User Info & Logout */}
        <div className="p-4">
          <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              {user?.role}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
