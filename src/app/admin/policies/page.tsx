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
  SelectValue,
} from '@/components/ui/select';
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
  const [searchBranch, setSearchBranch] = useState('');
  const [searchOccupation, setSearchOccupation] = useState('');

  useEffect(() => {
    dispatch(fetchPolicies());
    dispatch(fetchOccupationTypes());
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (searchName) params.name = searchName;
    if (searchBranch) params.branchId = searchBranch;
    if (searchOccupation) params.occupationTypeId = searchOccupation;
    dispatch(fetchPolicies(params));
  };

  const handleClear = () => {
    setSearchName('');
    setSearchBranch('');
    setSearchOccupation('');
    dispatch(fetchPolicies());
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus polis ini?')) return;
    const result = await dispatch(deletePolicy(id));
    if (deletePolicy.fulfilled.match(result)) {
      toast.success('Polis berhasil dihapus!');
    } else {
      toast.error(result.payload as string);
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

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Polis</h1>
          <p className="text-gray-500">
            Kelola data polis asuransi kebakaran
          </p>
        </div>

        {/* Search / Filter */}
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Cari nama pemegang polis..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <Select
                value={searchBranch}
                onValueChange={(val) => setSearchBranch(val ?? '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Select
                value={searchOccupation}
                onValueChange={(val) => setSearchOccupation(val ?? '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {occupationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              Cari
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Reset
            </Button>
          </CardContent>
        </Card>

        {/* Policies Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : policies.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                Tidak ada data polis.
              </div>
            ) : (
              <Table>
                <TableHeader>
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
                          className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(policy.id)}
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
