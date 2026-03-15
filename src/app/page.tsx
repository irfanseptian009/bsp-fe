'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Role } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/login');
    } else if (user.role === Role.ADMIN) {
      router.push('/admin/dashboard');
    } else {
      router.push('/customer/dashboard');
    }
  }, [user, accessToken, router]);

  return null;
}
