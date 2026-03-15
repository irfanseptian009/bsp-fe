'use client';

import { useEffect } from 'react';
import {
  FileText,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyRequests } from '@/store/slices/requestSlice';
import { Role, RequestStatus } from '@/types';
import { formatRupiah } from '@/lib/formatCurrency';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const approvalRate = totalRequests ? Math.round((approved / totalRequests) * 100) : 0;
  const totalCoverage = requests.reduce((sum, request) => sum + request.buildingPrice, 0);
  const totalPremium = requests.reduce((sum, request) => sum + request.totalAmount, 0);

  const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return `${date.getFullYear()}-${date.getMonth()}`;
  });

  const monthlyMap = new Map(
    monthKeys.map((key) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month);
      return [
        key,
        {
          month: monthFormatter.format(date),
          request: 0,
          approved: 0,
          premium: 0,
        },
      ];
    }),
  );

  requests.forEach((request) => {
    const date = new Date(request.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const monthData = monthlyMap.get(key);

    if (!monthData) return;

    monthData.request += 1;
    monthData.premium += request.totalAmount;

    if (request.status === RequestStatus.APPROVED) {
      monthData.approved += 1;
    }
  });

  const monthlyData = Array.from(monthlyMap.values());

  const statusData = [
    { name: 'Disetujui', value: approved, color: '#2563eb' },
    { name: 'Menunggu', value: pending, color: '#60a5fa' },
    { name: 'Ditolak', value: rejected, color: '#f97316' },
  ];

  const durationMap = requests.reduce<Record<string, number>>((acc, request) => {
    const key = `${request.duration} Tahun`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const durationData = Object.entries(durationMap)
    .map(([duration, total]) => ({ duration, total }))
    .sort((a, b) => parseInt(a.duration, 10) - parseInt(b.duration, 10));

  const topOccupations = Object.values(
    requests.reduce<Record<string, { name: string; count: number }>>((acc, request) => {
      const occupationName = request.occupationType?.name || 'Lainnya';
      if (!acc[occupationName]) {
        acc[occupationName] = { name: occupationName, count: 0 };
      }
      acc[occupationName].count += 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);


  return (
    <RouteGuard requiredRole={Role.CUSTOMER}>
      <div className="space-y-6">
        {/* Header */}
        <Card className="dark:from-primary/10 dark:via-background dark:to-background border-border/70 bg-linear-to-br shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="mb-3 bg-orange-300/20  border-orange-800/20 dark:text-white text-black hover:bg-orange-600/10">Customer Insight</Badge>
              <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400 md:text-3xl">
                Selamat datang, {user?.name} 👋
              </h1>
              <p className="text-muted-foreground mt-1">Pantau performa polis dan tren request Anda secara real-time.</p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:w-auto">
              <div className="bg-card border-border/70 rounded-xl border p-3">
                <p className="text-muted-foreground text-xs">Total Premi</p>
                <p className="text-foreground text-base font-bold">{formatRupiah(totalPremium)}</p>
              </div>
              <div className="bg-card border-border/70 rounded-xl border p-3">
                <p className="text-muted-foreground text-xs">Approval Rate</p>
                <p className="text-foreground text-base font-bold">{approvalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

   

        {/* Insight Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-lg p-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tren 6 Bulan</p>
                <p className="text-foreground text-lg font-semibold">{monthlyData[5]?.request ?? 0} request bulan ini</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 rounded-lg p-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Coverage</p>
                <p className="text-foreground text-lg font-semibold">{formatRupiah(totalCoverage)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 rounded-lg p-2">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Request Aktif</p>
                <p className="text-foreground text-lg font-semibold">{pending} request menunggu review</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Visualizations */}
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Performa Request 6 Bulan Terakhir</CardTitle>
              <p className="text-muted-foreground text-sm">Perbandingan total request dan request yang disetujui.</p>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="requestColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="approvedColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #94a3b833',
                      background: 'rgba(15, 23, 42, 0.92)',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="request"
                    stroke="#2563eb"
                    strokeWidth={2.2}
                    fill="url(#requestColor)"
                    name="Total Request"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#approvedColor)"
                    name="Disetujui"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Status</CardTitle>
              <p className="text-muted-foreground text-sm">Komposisi hasil proses underwriting.</p>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={4}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #94a3b833',
                      background: 'rgba(15, 23, 42, 0.92)',
                      color: '#f8fafc',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Preferensi Durasi Polis</CardTitle>
              <p className="text-muted-foreground text-sm">Visualisasi jumlah request berdasarkan durasi polis.</p>
            </CardHeader>
            <CardContent className="h-70">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis dataKey="duration" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #94a3b833',
                      background: 'rgba(15, 23, 42, 0.92)',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Okupasi</CardTitle>
              <p className="text-muted-foreground text-sm">Kategori bangunan yang paling sering diajukan.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {topOccupations.length === 0 ? (
                <p className="text-muted-foreground text-sm">Belum ada data okupasi.</p>
              ) : (
                topOccupations.map((item) => {
                  const percent = totalRequests ? Math.round((item.count / totalRequests) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-foreground line-clamp-1 text-sm font-medium">{item.name}</p>
                        <span className="text-muted-foreground text-xs">{item.count} req</span>
                      </div>
                      <div className="bg-muted h-2 rounded-full">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="text-primary h-5 w-5" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/customer/request">
              <Button className="gap-2 bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600">
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
