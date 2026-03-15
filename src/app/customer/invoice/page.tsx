'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, Landmark, Loader2, QrCode, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRequestByInvoice } from '@/store/slices/requestSlice';
import { formatIDR } from '@/lib/formatCurrency';
import { Role } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

/* ─── Inner content that uses useSearchParams ─── */
function InvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { selectedRequest, isLoading } = useAppSelector((state) => state.requests);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'va' | 'qris' | 'ewallet'>('va');

  const invoiceNumber = searchParams.get('inv');

  useEffect(() => {
    if (invoiceNumber && !selectedRequest) {
      dispatch(fetchRequestByInvoice(invoiceNumber));
    }
  }, [invoiceNumber, selectedRequest, dispatch]);

  const request = selectedRequest;

  if (!invoiceNumber) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-20">
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
  const paymentReference = (() => {
    const raw = request.invoiceNumber.replace(/[^0-9]/g, '').slice(-10) || request.id.slice(0, 10);
    return `8808${raw}`;
  })();

  const paymentInstructions = {
    va: {
      title: 'Virtual Account BCA',
      icon: Landmark,
      label: paymentReference,
      helper: 'Transfer tepat hingga nominal total agar pembayaran terverifikasi otomatis.',
    },
    qris: {
      title: 'QRIS Payment',
      icon: QrCode,
      label: `QRIS-${request.invoiceNumber}`,
      helper: 'Gunakan aplikasi mobile banking atau e-wallet untuk scan QRIS.',
    },
    ewallet: {
      title: 'E-Wallet',
      icon: Wallet,
      label: `BSP-${request.invoiceNumber}`,
      helper: 'Gunakan kode pembayaran ini pada menu transfer/e-wallet yang tersedia.',
    },
  } as const;

  const activePayment = paymentInstructions[paymentMethod];
  const ActivePaymentIcon = activePayment.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activePayment.label);
      toast.success('Kode pembayaran berhasil disalin.');
    } catch {
      toast.error('Gagal menyalin kode pembayaran.');
    }
  };

  const handleFinishPayment = () => {
    toast.success('Instruksi pembayaran berhasil ditampilkan. Silakan selesaikan pembayaran Anda.');
    setIsPaymentDialogOpen(false);
    router.push('/customer/my-requests');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-border/60 overflow-hidden border shadow-sm">
        {/* Header Row */}
        <div className="bg-muted/60 border-border grid grid-cols-4 border-b px-6 py-4">
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
            <div className="border-border p-6 not-last:border-r">
              <p className="text-foreground font-semibold">Asuransi Kebakaran</p>
              <p className="text-muted-foreground text-sm">
                {isRumah ? 'Rumah Tinggal bukan Ruko' : occupationName}
              </p>
              <p className="text-foreground/90 mt-2 text-sm font-semibold">
                No. Invoice : {request.invoiceNumber}
              </p>
            </div>

            {/* Period */}
            <div className="border-border p-6 not-last:border-r">
              <p className="text-foreground">{request.duration} Tahun</p>
            </div>

            {/* Earthquake */}
            <div className="border-border flex items-center justify-center p-6 not-last:border-r">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  request.earthquake
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {request.earthquake ? '✓' : '-'}
              </span>
            </div>

            {/* Building Price */}
            <div className="p-6">
              <p className="text-foreground">{formatIDR(request.buildingPrice)}</p>
            </div>
          </div>

          {/* Premium Breakdown */}
          <div className="border-border grid grid-cols-4 border-t">
            <div className="col-span-2" />
            <div className="col-span-2 divide-y">
              <div className="flex justify-between px-6 py-3">
                <span className="text-muted-foreground text-sm font-medium">
                  Premi Dasar :
                </span>
                <span className="text-foreground text-sm font-semibold">
                  {formatIDR(request.basicPremium)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-3">
                <span className="text-muted-foreground text-sm font-medium">
                  Biaya Administrasi :
                </span>
                <span className="text-foreground text-sm font-semibold">
                  {formatIDR(request.adminFee)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-3">
                <span className="text-foreground text-sm font-bold">Total :</span>
                <span className="text-foreground text-sm font-bold">
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
          className="bg-orange-500 hover:bg-orange-600 px-8 text-white"
          onClick={() => setIsPaymentDialogOpen(true)}
        >
          Lanjutkan Ke Pembayaran
        </Button>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pembayaran Invoice</DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran untuk invoice {request.invoiceNumber} dan gunakan instruksi di bawah ini untuk menyelesaikan transaksi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatIDR(request.totalAmount)}</p>
                </div>
                <div className="rounded-lg bg-white/80 px-3 py-2 text-right shadow-sm dark:bg-slate-900/60">
                  <p className="text-xs text-slate-500">Jatuh Tempo</p>
                  <p className="text-sm font-semibold">Hari ini</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Metode Pembayaran</p>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'va' | 'qris' | 'ewallet')}>
                <SelectTrigger>
                  <span className="line-clamp-1 text-left">{activePayment.title}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="va">Virtual Account BCA</SelectItem>
                  <SelectItem value="qris">QRIS Payment</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
                  <ActivePaymentIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{activePayment.title}</p>
                  <p className="text-muted-foreground text-sm">{activePayment.helper}</p>
                </div>
              </div>
              <Separator className="mb-3" />
              <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-orange-200 bg-orange-50/80 px-3 py-3 dark:border-orange-500/20 dark:bg-orange-500/10">
                <div>
                  <p className="text-muted-foreground text-xs">Kode Pembayaran</p>
                  <p className="font-mono text-sm font-semibold">{activePayment.label}</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Salin
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4 text-sm">
              <p className="mb-2 font-semibold">Langkah Pembayaran</p>
              <ol className="text-muted-foreground list-decimal space-y-1 pl-5">
                <li>Pilih metode pembayaran yang Anda inginkan.</li>
                <li>Salin kode pembayaran atau gunakan QRIS sesuai metode.</li>
                <li>Selesaikan pembayaran sesuai total invoice.</li>
                <li>Setelah pembayaran berhasil, status akan diverifikasi oleh admin.</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Nanti Saja
            </Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={handleFinishPayment}>
              Saya Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
