'use client';

import { useEffect } from 'react';
import {
  Wallet,
  Landmark,
  BriefcaseBusiness,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
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
import { fetchAllRequests } from '@/store/slices/requestSlice';
import { fetchOccupationTypes } from '@/store/slices/occupationSlice';
import { formatRupiah } from '@/lib/formatCurrency';
import { Role, RequestStatus } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const approvalRate = totalRequests ? Math.round((approved / totalRequests) * 100) : 0;
  const rejectionRate = totalRequests ? Math.round((rejected / totalRequests) * 100) : 0;
  const totalCoverage = requests.reduce((sum, r) => sum + r.buildingPrice, 0);

  const totalRevenue = requests
    .filter((r) => r.status === RequestStatus.APPROVED)
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const avgApprovedPremium = approved ? Math.round(totalRevenue / approved) : 0;

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
          revenue: 0,
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
    if (request.status === RequestStatus.APPROVED) {
      monthData.approved += 1;
      monthData.revenue += request.totalAmount;
    }
  });

  const monthlyData = Array.from(monthlyMap.values());

  const statusData = [
    { name: 'Disetujui', value: approved, color: '#2563eb' },
    { name: 'Menunggu', value: pending, color: '#60a5fa' },
    { name: 'Ditolak', value: rejected, color: '#f97316' },
  ];

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
    .slice(0, 6);

  const occupationChartData = topOccupations.map((item) => ({
    name: item.name.length > 16 ? `${item.name.slice(0, 16)}...` : item.name,
    total: item.count,
  }));

  const recentRequests = [...requests]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);


  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <Card className="dark:from-primary/10 dark:via-background dark:to-background border-border/70 bg-linear-to-br shadow-sm">
          <CardContent className="flex flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="mb-3 p-2 mb-6 dark:bg-orange-600/30 bg-orange-600/20 text-blue-500 dark:text-white  hover:bg-orange-600">Admin Command Center</Badge>
              <h1 className="text-2xl font-bold text-orange-600/40 dark:text-orange-400/40 md:text-3xl">Dashboard Administrator</h1>
              <p className="text-muted-foreground mt-1">Selamat datang, {user?.name}. Pantau performa operasional dan bisnis secara menyeluruh.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:w-90">
              <div className="bg-card border-border/70 rounded-xl border p-3">
                <p className="text-muted-foreground text-xs">Total Pendapatan</p>
                <p className="text-foreground text-base font-bold">{formatRupiah(totalRevenue)}</p>
              </div>
              <div className="bg-card border-border/70 rounded-xl border p-3">
                <p className="text-muted-foreground text-xs">Approval Rate</p>
                <p className="text-foreground text-base font-bold">{approvalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

     

        {/* Executive Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-lg p-2">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Avg Premi Approved</p>
                <p className="text-foreground font-semibold">{formatRupiah(avgApprovedPremium)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-lg p-2">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Coverage</p>
                <p className="text-foreground font-semibold">{formatRupiah(totalCoverage)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 rounded-lg p-2">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Okupasi Terdaftar</p>
                <p className="text-foreground font-semibold">{occupationTypes.length} kategori</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 rounded-lg p-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Rejection Rate</p>
                <p className="text-foreground font-semibold">{rejectionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Visualizations */}
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Tren Request & Revenue (6 Bulan)</CardTitle>
              <p className="text-muted-foreground text-sm">Pantau pertumbuhan request dan pendapatan approved tiap bulan.</p>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="requestAdminColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="approvedAdminColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #94a3b833',
                      background: 'rgba(15, 23, 42, 0.92)',
                      color: '#f8fafc',
                    }}
                  />
                  <Area type="monotone" dataKey="request" stroke="#2563eb" strokeWidth={2.2} fill="url(#requestAdminColor)" name="Total Request" />
                  <Area type="monotone" dataKey="approved" stroke="#f97316" strokeWidth={2} fill="url(#approvedAdminColor)" name="Disetujui" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Status</CardTitle>
              <p className="text-muted-foreground text-sm">Komposisi current pipeline permintaan.</p>
            </CardHeader>
            <CardContent className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
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
              <CardTitle className="text-lg">Okupasi Paling Banyak Diajukan</CardTitle>
              <p className="text-muted-foreground text-sm">Membantu identifikasi fokus pasar dan prioritas underwriting.</p>
            </CardHeader>
            <CardContent className="h-70">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupationChartData} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={130} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #94a3b833',
                      background: 'rgba(15, 23, 42, 0.92)',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="text-primary h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <p className="text-muted-foreground text-sm">5 request terbaru yang masuk ke sistem.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRequests.length === 0 ? (
                <p className="text-muted-foreground text-sm">Belum ada aktivitas terbaru.</p>
              ) : (
                recentRequests.map((request) => (
                  <div key={request.id} className="border-border/70 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-foreground text-sm font-medium">{request.invoiceNumber}</p>
                      <Badge
                        className={
                          request.status === RequestStatus.APPROVED
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300'
                            : request.status === RequestStatus.REJECTED
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/20 dark:text-orange-300'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">{new Date(request.createdAt).toLocaleDateString('id-ID')}</p>
                      <p className="text-foreground text-xs font-semibold">{formatRupiah(request.totalAmount)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-primary/15 text-primary rounded-lg p-2">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">Insight Otomatis</p>
                <p className="text-muted-foreground text-sm">
                  Dengan approval rate {approvalRate}% dan total revenue {formatRupiah(totalRevenue)}, fokuskan review pada request pending
                  agar konversi meningkat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
