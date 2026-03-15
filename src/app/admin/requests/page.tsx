'use client';

import { useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
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

  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);

  const handleApprove = async (id: string) => {
    const result = await dispatch(approveRequest(id));
    if (approveRequest.fulfilled.match(result)) {
      toast.success(
        'Request berhasil disetujui! Nomor polis: ' + result.payload.policyNumber,
      );
    } else {
      toast.error(result.payload as string);
    }
  };

  const handleReject = async (id: string) => {
    const result = await dispatch(rejectRequest(id));
    if (rejectRequest.fulfilled.match(result)) {
      toast.success('Request berhasil ditolak.');
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Request</h1>
          <p className="text-gray-500">
            Kelola request asuransi kebakaran dari customer
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                Belum ada request masuk.
              </div>
            ) : (
              <Table>
                <TableHeader>
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
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">
                        {req.invoiceNumber}
                      </TableCell>
                      <TableCell>{req.user?.name || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {req.address}
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
                              onClick={() => handleApprove(req.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleReject(req.id)}
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
      </div>
    </RouteGuard>
  );
}
