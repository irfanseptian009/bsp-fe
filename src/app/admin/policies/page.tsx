'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPolicies, deletePolicy } from '@/store/slices/policySlice';
import { fetchOccupationTypes } from '@/store/slices/occupationSlice';
import { fetchBranches } from '@/store/slices/branchSlice';
import { formatRupiah } from '@/lib/formatCurrency';
import { Role } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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

export default function PoliciesPage() {
  const dispatch = useAppDispatch();
  const { policies, isLoading } = useAppSelector((state) => state.policies);
  const { occupationTypes } = useAppSelector((state) => state.occupations);
  const { branches } = useAppSelector((state) => state.branches);

  const [searchName, setSearchName] = useState('');
  const [searchBranch, setSearchBranch] = useState('all');
  const [searchOccupation, setSearchOccupation] = useState('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPolicies());
    dispatch(fetchOccupationTypes());
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    const trimmedName = searchName.trim();
    if (trimmedName) params.name = trimmedName;
    if (searchBranch !== 'all') params.branchId = searchBranch;
    if (searchOccupation !== 'all') params.occupationTypeId = searchOccupation;
    dispatch(fetchPolicies(params));
  };

  const handleClear = () => {
    setSearchName('');
    setSearchBranch('all');
    setSearchOccupation('all');
    dispatch(fetchPolicies());
  };

  const getErrorMessage = (payload: unknown, fallback: string) => {
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload;
    }
    return fallback;
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const result = await dispatch(deletePolicy(deleteTargetId));
    if (deletePolicy.fulfilled.match(result)) {
      toast.success('Polis berhasil dihapus!');
      setDeleteTargetId(null);
    } else {
      toast.error(
        getErrorMessage(result.payload, 'Gagal menghapus polis. Silakan coba lagi.'),
      );
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const selectedBranchLabel =
    searchBranch === 'all'
      ? 'Semua Cabang'
      : (() => {
          const selected = branches.find((branch) => branch.id === searchBranch);
          return selected ? `${selected.code} - ${selected.name}` : 'Semua Cabang';
        })();

  const selectedOccupationLabel =
    searchOccupation === 'all'
      ? 'Semua Tipe'
      : (() => {
          const selected = occupationTypes.find((type) => type.id === searchOccupation);
          return selected ? `${selected.code} - ${selected.name}` : 'Semua Tipe';
        })();

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Data Polis</h1>
          <p className="text-gray-500">
            Kelola data polis asuransi kebakaran
          </p>
        </div>

        {/* Search / Filter */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="grid gap-3 p-4 md:grid-cols-12">
            <div className="md:col-span-4 lg:col-span-5">
              <Input
                placeholder="Cari nama pemegang polis..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
            </div>
            <div className="md:col-span-3 lg:col-span-2">
              <Select
                value={searchBranch}
                onValueChange={(value) => setSearchBranch(value ?? 'all')}
              >
                <SelectTrigger className="w-full min-w-0">
                  <span className="text-left line-clamp-1">{selectedBranchLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.code} - {branch.name || branch.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 lg:col-span-2">
              <Select
                value={searchOccupation}
                onValueChange={(value) => setSearchOccupation(value ?? 'all')}
              >
                <SelectTrigger className="w-full min-w-0">
                  <span className="text-left line-clamp-1">{selectedOccupationLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {occupationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.code} - {type.name || type.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="gap-2 bg-orange-500 text-white hover:bg-orange-600 md:col-span-2 lg:col-span-1"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              Cari
            </Button>
            <Button variant="outline" onClick={handleClear} className="md:col-span-2 lg:col-span-1">
              Reset
            </Button>
          </CardContent>
        </Card>

        <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Polis</DialogTitle>
              <DialogDescription>
                Yakin ingin menghapus polis ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Batal
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Policies Table */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : policies.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center">
                Tidak ada data polis.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>No. Polis</TableHead>
                    <TableHead>No. Aplikasi</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead className="text-center">Usia</TableHead>
                    <TableHead className="text-center">Jangka Waktu</TableHead>
                    <TableHead className="text-right">Harga Bangunan</TableHead>
                    <TableHead>Tipe Bangunan</TableHead>
                    <TableHead className="text-right">Premi</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-mono text-sm">
                        {policy.policyNumber}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {policy.applicationNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {policy.name}
                      </TableCell>
                      <TableCell>{policy.branch?.name || '-'}</TableCell>
                      <TableCell className="text-center">
                        {calculateAge(policy.birthDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {policy.duration}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(policy.buildingPrice)}
                      </TableCell>
                      <TableCell>
                        {policy.occupationType?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(policy.premium)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => setDeleteTargetId(policy.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
