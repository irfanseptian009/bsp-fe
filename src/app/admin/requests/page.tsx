'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle, XCircle, Search, ClipboardList, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAllRequests,
  approveRequest,
  rejectRequest,
} from '@/store/slices/requestSlice';
import { formatRupiah } from '@/lib/formatCurrency';
import StatusBadge from '@/components/shared/StatusBadge';
import { Role, RequestStatus } from '@/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminRequestsPage() {
  const dispatch = useAppDispatch();
  const { requests, isLoading } = useAppSelector((state) => state.requests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: 'approve' | 'reject';
  } | null>(null);

  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesKeyword =
        !keyword ||
        req.invoiceNumber.toLowerCase().includes(keyword) ||
        (req.user?.name || '').toLowerCase().includes(keyword) ||
        (req.occupationType?.name || '').toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const totalRequest = filteredRequests.length;
  const approvedCount = filteredRequests.filter((req) => req.status === RequestStatus.APPROVED).length;
  const pendingCount = filteredRequests.filter((req) => req.status === RequestStatus.PENDING).length;
  const rejectedCount = filteredRequests.filter((req) => req.status === RequestStatus.REJECTED).length;

  const getErrorMessage = (payload: unknown, fallback: string) => {
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload;
    }
    return fallback;
  };

  const handleApprove = async (id: string) => {
    const result = await dispatch(approveRequest(id));
    if (approveRequest.fulfilled.match(result)) {
      toast.success(
        'Request berhasil disetujui! Nomor polis: ' + result.payload.policyNumber,
      );
    } else {
      toast.error(
        getErrorMessage(result.payload, 'Gagal menyetujui request. Silakan coba lagi.'),
      );
    }
  };

  const handleReject = async (id: string) => {
    const result = await dispatch(rejectRequest(id));
    if (rejectRequest.fulfilled.match(result)) {
      toast.success('Request berhasil ditolak.');
    } else {
      toast.error(
        getErrorMessage(result.payload, 'Gagal menolak request. Silakan coba lagi.'),
      );
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'approve') {
      await handleApprove(confirmAction.id);
    } else {
      await handleReject(confirmAction.id);
    }

    setConfirmAction(null);
  };

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <div className="dark:from-primary/10 dark:via-background dark:to-background rounded-2xl border border-orange-100/60 bg-linear-to-br p-5 shadow-sm dark:border-orange-500/20">
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Daftar Request</h1>
          <p className="text-muted-foreground mt-1">
            Kelola request asuransi kebakaran dari customer
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Total</p>
              <div className="mt-1 flex items-center gap-2">
                <ClipboardList className="text-primary h-4 w-4" />
                <p className="text-lg font-semibold">{totalRequest}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Menunggu</p>
              <div className="mt-1 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-orange-600" />
                <p className="text-lg font-semibold">{pendingCount}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Disetujui</p>
              <div className="mt-1 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <p className="text-lg font-semibold">{approvedCount}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Ditolak</p>
              <div className="mt-1 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-500" />
                <p className="text-lg font-semibold">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-0 p-0">
            <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-3 md:px-6">
              <div className="relative md:col-span-2">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari invoice, customer, atau tipe okupasi..."
                  className="pl-9"
                />
              </div>
              <Select<'all' | RequestStatus>
                value={statusFilter}
                onValueChange={(val) => setStatusFilter((val ?? 'all') as 'all' | RequestStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value={RequestStatus.PENDING}>Menunggu</SelectItem>
                  <SelectItem value={RequestStatus.APPROVED}>Disetujui</SelectItem>
                  <SelectItem value={RequestStatus.REJECTED}>Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                Belum ada request masuk.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Nomor Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Tipe Okupasi</TableHead>
                    <TableHead className="text-right">Total Bayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">
                        {req.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-blue-200 bg-blue-50">
                            {req.user?.profilePhotoUrl ? (
                              <Image
                                src={req.user.profilePhotoUrl}
                                alt={req.user?.name || 'Customer'}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-blue-700">
                                {(req.user?.name?.[0] || 'U').toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span>{req.user?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-72 truncate" title={req.address}>
                          {req.address}
                        </p>
                      </TableCell>
                      <TableCell>
                        {req.occupationType?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(req.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        {req.status === RequestStatus.PENDING ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                              onClick={() =>
                                setConfirmAction({
                                  id: req.id,
                                  type: 'approve',
                                })
                              }
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() =>
                                setConfirmAction({
                                  id: req.id,
                                  type: 'reject',
                                })
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            {req.policyNumber || '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmAction?.type === 'approve'
                  ? 'Konfirmasi Approve Request'
                  : 'Konfirmasi Reject Request'}
              </DialogTitle>
              <DialogDescription>
                {confirmAction?.type === 'approve'
                  ? 'Yakin ingin menyetujui request ini? Nomor polis akan dibuat otomatis.'
                  : 'Yakin ingin menolak request ini? Tindakan ini tidak dapat dibatalkan.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Batal
              </Button>
              <Button
                className={
                  confirmAction?.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
                onClick={handleConfirmAction}
              >
                {confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
