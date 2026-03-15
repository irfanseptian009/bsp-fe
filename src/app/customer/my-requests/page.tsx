'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ClipboardList, Clock3, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyRequests } from '@/store/slices/requestSlice';
import StatusBadge from '@/components/shared/StatusBadge';
import { Role, RequestStatus } from '@/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

/* ─── Insurance type tabs ─── */
const INSURANCE_TABS = [
  { key: 'kebakaran', label: 'Kebakaran' },
  { key: 'gempa', label: 'Gempa Bumi' },
  { key: 'kendaraan', label: 'Kendaraan Bermotor' },
  { key: 'kecelakaan', label: 'Kecelakaan Diri' },
  { key: 'kesehatan', label: 'Kesehatan' },
] as const;

type InsuranceTabKey = (typeof INSURANCE_TABS)[number]['key'];

export default function MyRequestsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { requests, isLoading } = useAppSelector((state) => state.requests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [activeTab, setActiveTab] = useState<InsuranceTabKey>('kebakaran');
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [selectedClaimRequestId, setSelectedClaimRequestId] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [estimatedLoss, setEstimatedLoss] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    dispatch(fetchMyRequests());
  }, [dispatch]);

  const mapRequestToCategory = (key: InsuranceTabKey, earthquake?: boolean) => {
    if (key === 'kebakaran') return true;
    if (key === 'gempa') return Boolean(earthquake);
    return false;
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesCategory = mapRequestToCategory(activeTab, req.earthquake);

      const keyword = searchTerm.trim().toLowerCase();
      const matchesKeyword =
        !keyword ||
        req.invoiceNumber.toLowerCase().includes(keyword) ||
        (req.policyNumber || '').toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

      return matchesCategory && matchesKeyword && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter, activeTab]);

  const claimableRequests = useMemo(() => {
    return requests.filter(
      (req) =>
        mapRequestToCategory(activeTab, req.earthquake) &&
        req.status === RequestStatus.APPROVED &&
        Boolean(req.policyNumber),
    );
  }, [requests, activeTab]);

  const selectedClaimLabel = useMemo(() => {
    const selected = claimableRequests.find((req) => req.id === selectedClaimRequestId);
    if (!selected) return '';
    return `${selected.policyNumber} - ${selected.invoiceNumber}`;
  }, [claimableRequests, selectedClaimRequestId]);

  const openClaimDialog = () => {
    if (claimableRequests.length === 0) {
      toast.error('Belum ada polis aktif untuk diajukan klaim pada kategori ini.');
      return;
    }

    setSelectedClaimRequestId(claimableRequests[0].id);
    setClaimReason('');
    setIncidentDate('');
    setIncidentLocation('');
    setEstimatedLoss('');
    setContactPhone('');
    setIsClaimDialogOpen(true);
  };

  const submitClaim = () => {
    if (!selectedClaimRequestId) {
      toast.error('Pilih polis terlebih dahulu.');
      return;
    }

    if (claimReason.trim().length < 10) {
      toast.error('Deskripsi klaim minimal 10 karakter agar dapat diproses.');
      return;
    }

    if (!incidentDate) {
      toast.error('Tanggal kejadian wajib diisi.');
      return;
    }

    if (incidentLocation.trim().length < 5) {
      toast.error('Lokasi kejadian minimal 5 karakter.');
      return;
    }

    const lossNumber = Number(estimatedLoss);
    if (!estimatedLoss || Number.isNaN(lossNumber) || lossNumber <= 0) {
      toast.error('Perkiraan kerugian harus lebih dari 0.');
      return;
    }

    if (contactPhone.trim().length < 8) {
      toast.error('Nomor kontak minimal 8 digit.');
      return;
    }

    const selectedRequest = requests.find((req) => req.id === selectedClaimRequestId);

    toast.success(
      `Pengajuan klaim untuk ${selectedRequest?.invoiceNumber || 'polis'} berhasil dikirim. Tim kami akan menghubungi Anda di ${contactPhone}.`,
    );

    setIsClaimDialogOpen(false);
  };

  const selectedTabLabel = INSURANCE_TABS.find((tab) => tab.key === activeTab)?.label || 'Kebakaran';
  const totalRequest = filteredRequests.length;
  const approvedCount = filteredRequests.filter((req) => req.status === RequestStatus.APPROVED).length;
  const pendingCount = filteredRequests.filter((req) => req.status === RequestStatus.PENDING).length;

  return (
    <RouteGuard requiredRole={Role.CUSTOMER}>
      <div className="space-y-6">
        <div className="dark:from-primary/10 dark:via-background dark:to-background rounded-2xl border border-orange-100/60 bg-linear-to-br p-5 shadow-sm dark:border-orange-500/20">
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Request Saya</h1>
          <p className="text-muted-foreground mt-1">
            Status request asuransi kebakaran Anda
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Total Request</p>
              <div className="mt-1 flex items-center gap-2">
                <ClipboardList className="text-primary h-4 w-4" />
                <p className="text-lg font-semibold">{totalRequest}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Disetujui</p>
              <div className="mt-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <p className="text-lg font-semibold">{approvedCount}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white/80 p-3 shadow-xs dark:bg-slate-900/60">
              <p className="text-muted-foreground text-xs">Menunggu</p>
              <div className="mt-1 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-orange-600" />
                <p className="text-lg font-semibold">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/70 shadow-sm">
          {/* Tab navigation + Pengajuan Klaim button */}
          <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-6">
            <div className="flex flex-wrap items-center gap-1">
              {INSURANCE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={openClaimDialog}
            >
              Pengajuan Klaim
            </Button>
          </div>

          <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-3 md:px-6">
            <div className="relative md:col-span-2">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nomor invoice / nomor polis..."
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

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                {activeTab === 'kebakaran' || activeTab === 'gempa'
                  ? 'Belum ada request pada filter ini.'
                  : `Produk ${selectedTabLabel} belum tersedia. Silakan pilih produk lain.`}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>No Polis</TableHead>
                    <TableHead>Jenis Penanggungan</TableHead>
                    <TableHead>No Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
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
                            router.push(`/customer/invoice?inv=${encodeURIComponent(req.invoiceNumber)}`);
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

        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pengajuan Klaim</DialogTitle>
              <DialogDescription>
                Pilih polis yang akan diklaim dan isi kronologi singkat agar tim kami dapat memproses lebih cepat.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="claim-policy">Pilih Polis</Label>
                <Select value={selectedClaimRequestId} onValueChange={(val) => setSelectedClaimRequestId(val || '')}>
                  <SelectTrigger id="claim-policy">
                    <span className="text-left line-clamp-1">
                      {selectedClaimLabel || 'Pilih polis'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {claimableRequests.map((req) => (
                      <SelectItem key={req.id} value={req.id}>
                        {req.policyNumber} - {req.invoiceNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-reason">Deskripsi Klaim</Label>
                <Textarea
                  id="claim-reason"
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  placeholder="Contoh: Terjadi kerusakan akibat kebakaran di area dapur pada tanggal ..."
                  rows={4}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="incident-date">Tanggal Kejadian</Label>
                  <Input
                    id="incident-date"
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-loss">Perkiraan Kerugian</Label>
                  <Input
                    id="estimated-loss"
                    type="number"
                    min={0}
                    placeholder="Contoh: 25000000"
                    value={estimatedLoss}
                    onChange={(e) => setEstimatedLoss(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident-location">Lokasi Kejadian</Label>
                <Input
                  id="incident-location"
                  placeholder="Contoh: Jl. Merdeka No. 10, Jakarta"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-contact">Nomor Kontak Aktif</Label>
                <Input
                  id="claim-contact"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClaimDialogOpen(false)}>
                Batal
              </Button>
              <Button className="bg-orange-500 text-white hover:bg-orange-600" onClick={submitClaim}>
                Kirim Klaim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
