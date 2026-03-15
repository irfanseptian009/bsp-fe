'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@/types';
import AppLayout from '@/components/layout/AppLayout';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      const redirectPath =
        user.role === Role.ADMIN ? '/admin/dashboard' : '/customer/dashboard';
      router.push(redirectPath);
    }
  }, [user, accessToken, requiredRole, router]);

  if (!accessToken || !user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
