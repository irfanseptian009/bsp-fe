'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyRequests } from '@/store/slices/requestSlice';
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

/* ─── Insurance type tabs ─── */
const INSURANCE_TABS = [
  { key: 'kebakaran', label: 'Kebakaran', active: true },
  { key: 'gempa', label: 'Gempa Bumi', active: false },
  { key: 'kendaraan', label: 'Kendaraan Bermotor', active: false },
  { key: 'kecelakaan', label: 'Kecelakaan Diri', active: false },
  { key: 'kesehatan', label: 'Kesehatan', active: false },
];

export default function MyRequestsPage() {
  const dispatch = useAppDispatch();
  const { requests, isLoading } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  return (
    <RouteGuard requiredRole={Role.CUSTOMER}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Saya</h1>
          <p className="text-gray-500">
            Status request asuransi kebakaran Anda
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          {/* Tab navigation + Pengajuan Klaim button */}
          <div className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex items-center gap-1">
              {INSURANCE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  disabled={!tab.active}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 cursor-not-allowed'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Pengajuan Klaim
            </Button>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                Belum ada request. Ajukan asuransi kebakaran pertama Anda!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No Polis</TableHead>
                    <TableHead>Jenis Penanggungan</TableHead>
                    <TableHead>No Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-sm">
                        {req.status === RequestStatus.APPROVED
                          ? req.policyNumber
                          : 'Belum Terbit'}
                      </TableCell>
                      <TableCell>Asuransi Kebakaran</TableCell>
                      <TableCell className="font-mono text-sm">
                        {req.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            window.location.href = `/customer/invoice?inv=${encodeURIComponent(req.invoiceNumber)}`;
                          }}
                        >
                          Lihat Rincian
                        </Button>
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
