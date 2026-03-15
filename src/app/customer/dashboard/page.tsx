'use client';

import { useEffect } from 'react';
import { FileText, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyRequests } from '@/store/slices/requestSlice';
import { Role, RequestStatus } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CustomerDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { requests } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const totalRequests = requests.length;
  const approved = requests.filter((r) => r.status === RequestStatus.APPROVED).length;
  const rejected = requests.filter((r) => r.status === RequestStatus.REJECTED).length;
  const pending = requests.filter((r) => r.status === RequestStatus.PENDING).length;

  const stats = [
    { label: 'Total Request', value: totalRequests, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Disetujui', value: approved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Ditolak', value: rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Menunggu', value: pending, icon: FileText, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <RouteGuard requiredRole={Role.CUSTOMER}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang, {user?.name} 👋
          </h1>
          <p className="text-gray-500">Dashboard asuransi kebakaran Anda</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/customer/request">
              <Button className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <FileText className="h-4 w-4" />
                Ajukan Asuransi Baru
              </Button>
            </Link>
            <Link href="/customer/my-requests">
              <Button variant="outline" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Lihat Request Saya
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
