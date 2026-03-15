'use client';

import { useEffect } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllRequests } from '@/store/slices/requestSlice';
import { fetchOccupationTypes } from '@/store/slices/occupationSlice';
import { formatRupiah } from '@/lib/formatCurrency';
import { Role, RequestStatus } from '@/types';

import { Card, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { requests } = useAppSelector((state) => state.requests);
  const { occupationTypes } = useAppSelector((state) => state.occupations);

  useEffect(() => {
    dispatch(fetchAllRequests());
    dispatch(fetchOccupationTypes());
  }, [dispatch]);

  const totalRequests = requests.length;
  const approved = requests.filter((r) => r.status === RequestStatus.APPROVED).length;
  const rejected = requests.filter((r) => r.status === RequestStatus.REJECTED).length;
  const pending = requests.filter((r) => r.status === RequestStatus.PENDING).length;

  const totalRevenue = requests
    .filter((r) => r.status === RequestStatus.APPROVED)
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const stats = [
    { label: 'Total Request', value: totalRequests, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Menunggu', value: pending, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Disetujui', value: approved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Ditolak', value: rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Administrator
          </h1>
          <p className="text-gray-500">Selamat datang, {user?.name}</p>
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

        {/* Revenue & Occupation Types Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Total Pendapatan (Approved)</p>
              <p className="mt-1 text-3xl font-bold text-green-600">
                {formatRupiah(totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">Tipe Okupasi Terdaftar</p>
              <p className="mt-1 text-3xl font-bold text-orange-600">
                {occupationTypes.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RouteGuard>
  );
}
