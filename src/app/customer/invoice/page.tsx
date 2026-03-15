'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRequestByInvoice } from '@/store/slices/requestSlice';
import { formatIDR } from '@/lib/formatCurrency';
import { Role } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/* ─── Inner content that uses useSearchParams ─── */
function InvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { selectedRequest, isLoading } = useAppSelector((state) => state.requests);

  const invoiceNumber = searchParams.get('inv');

  useEffect(() => {
    if (invoiceNumber && !selectedRequest) {
      dispatch(fetchRequestByInvoice(invoiceNumber));
    }
  }, [invoiceNumber, selectedRequest, dispatch]);

  const request = selectedRequest;

  if (!invoiceNumber) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Nomor invoice tidak ditemukan.
      </div>
    );
  }

  if (isLoading || !request) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const occupationName = request.occupationType?.name || '-';
  const isRumah = occupationName.toLowerCase().includes('rumah');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-4 border-b bg-gray-50 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Premi Terbaik</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600">Periode</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600">Perluasan</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600">Harga Bangunan</p>
          </div>
        </div>

        {/* Data Row */}
        <CardContent className="p-0">
          <div className="grid grid-cols-4 items-start">
            {/* Product Info */}
            <div className="border-r p-6">
              <p className="font-semibold text-gray-900">Asuransi Kebakaran</p>
              <p className="text-sm text-gray-500">
                {isRumah ? 'Rumah Tinggal bukan Ruko' : occupationName}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-700">
                No. Invoice : {request.invoiceNumber}
              </p>
            </div>

            {/* Period */}
            <div className="border-r p-6">
              <p className="text-gray-900">{request.duration} Tahun</p>
            </div>

            {/* Earthquake */}
            <div className="border-r p-6 flex items-center justify-center">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  request.earthquake
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {request.earthquake ? '✓' : '-'}
              </span>
            </div>

            {/* Building Price */}
            <div className="p-6">
              <p className="text-gray-900">{formatIDR(request.buildingPrice)}</p>
            </div>
          </div>

          {/* Premium Breakdown */}
          <div className="grid grid-cols-4 border-t">
            <div className="col-span-2" />
            <div className="col-span-2 divide-y">
              <div className="flex justify-between px-6 py-3">
                <span className="text-sm font-medium text-gray-600">
                  Premi Dasar :
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatIDR(request.basicPremium)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-3">
                <span className="text-sm font-medium text-gray-600">
                  Biaya Administrasi :
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatIDR(request.adminFee)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-3">
                <span className="text-sm font-bold text-gray-900">Total :</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatIDR(request.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-700 px-8 text-white"
          onClick={() => router.push('/customer/my-requests')}
        >
          Lanjutkan Ke Pembayaran
        </Button>
      </div>
    </div>
  );
}

/* ─── Page wrapper with Suspense (required by Next.js for useSearchParams) ─── */
export default function InvoicePage() {
  return (
    <RouteGuard requiredRole={Role.CUSTOMER}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        }
      >
        <InvoiceContent />
      </Suspense>
    </RouteGuard>
  );
}
